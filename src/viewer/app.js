// 학습 화면. 모든 그림과 표는 서버가 돌려준 "실제 실행 기록(JSON)" 에서만 만든다.
// 이전/다음 버튼은 이미 받은 기록을 넘겨 볼 뿐이며 아무것도 다시 실행하지 않는다.

const $ = (s) => document.querySelector(s);
const SVGNS = "http://www.w3.org/2000/svg";
const state = { units: [], unit: null, runs: [], run: null, step: 0, tab: "structure", showAll: false };

function h(tag, attrs = {}, ...kids) {
  const el = attrs.svg ? document.createElementNS(SVGNS, tag) : document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "svg" || v === undefined || v === null || v === false) continue;
    if (k === "class") el.setAttribute("class", v);
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  return el;
}
const clip = (s, n = 70) => { s = String(s ?? ""); return (s.length > n ? s.slice(0, n) + "…" : s).replace(/\n/g, " ⏎ "); };
const api = async (url, opts) => (await fetch(url, opts)).json();
const ICON = { pass: "✔", fail: "✘", none: "·", partial: "◐" };
const LABEL = { none: "아직", partial: "일부", pass: "통과", done: "완료" };

// ───────────── 문서 보기 (작은 마크다운) ─────────────
const slug = (t) => t.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-");
function md(text) {
  const root = h("div", { class: "md" });
  const lines = text.split(/\r?\n/);
  const inline = (s) => {
    const span = h("span");
    const re = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
    let last = 0, m;
    while ((m = re.exec(s))) {
      span.append(s.slice(last, m.index));
      const t = m[0];
      if (t.startsWith("`")) span.append(h("code", {}, t.slice(1, -1)));
      else if (t.startsWith("**")) span.append(h("b", {}, t.slice(2, -2)));
      else {
        const [, label, href] = t.match(/\[([^\]]+)\]\(([^)]+)\)/);
        span.append(/\.md(#|$)/.test(href) && !/^https?:/.test(href) ? h("a", { tabindex: 0, onclick: () => openDoc(href) }, label) : label);
      }
      last = m.index + t.length;
    }
    span.append(s.slice(last));
    return span;
  };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith("```")) {
      const buf = [];
      for (i++; i < lines.length && !lines[i].startsWith("```"); i++) buf.push(lines[i]);
      root.append(h("pre", {}, buf.join("\n")));
    } else if (/^#{1,4}\s/.test(l)) {
      const lv = l.match(/^#+/)[0].length;
      const t = l.replace(/^#+\s*/, "");
      root.append(h("h" + Math.min(lv, 4), { id: slug(t) }, t));
    } else if (l.startsWith("|")) {
      const rows = [];
      for (; i < lines.length && lines[i].startsWith("|"); i++) rows.push(lines[i]);
      i--;
      const cells = (r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const body = rows.filter((r) => !/^\|[\s:|-]+\|?$/.test(r));
      const [head, ...rest] = body.map(cells);
      root.append(h("table", {}, h("thead", {}, h("tr", {}, head.map((c) => h("th", {}, inline(c))))), h("tbody", {}, rest.map((r) => h("tr", {}, r.map((c) => h("td", {}, inline(c))))))));
    } else if (/^\s*([-*]|\d+\.)\s/.test(l)) {
      const items = [];
      for (; i < lines.length && /^\s*([-*]|\d+\.)\s/.test(lines[i]); i++) items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s/, ""));
      i--;
      root.append(h("ul", {}, items.map((it) => h("li", {}, inline(it)))));
    } else if (l.startsWith(">")) {
      root.append(h("div", { class: "note" }, inline(l.replace(/^>\s?/, ""))));
    } else if (l.trim()) root.append(h("p", {}, inline(l)));
  }
  return root;
}
let docBase = "";
function resolveDoc(p) {
  if (/^(docs|units)\//.test(p) || !docBase) return p;
  const parts = docBase.split("/").slice(0, -1);
  for (const seg of p.split("/")) { if (seg === "..") parts.pop(); else if (seg !== ".") parts.push(seg); }
  return parts.join("/");
}
async function openDoc(ref) {
  const [rawPath, anchor] = ref.split(/\s*#/);
  const path = resolveDoc(rawPath);
  docBase = path;
  const d = await api("/api/doc?path=" + encodeURIComponent(path));
  $("#doctitle").textContent = d.path ?? path;
  const body = $("#docbody");
  body.replaceChildren(d.error ? h("p", { class: "bad" }, d.error + ": " + path) : md(d.text));
  if (!$("#doc").open) $("#doc").showModal();
  if (anchor) body.querySelector("#" + CSS.escape(anchor))?.scrollIntoView();
  else body.scrollTop = 0;
}

// ───────────── 그래프 ─────────────
function layout(nodes, edges) {
  const depth = {};
  const incoming = new Set(edges.map((e) => e.to));
  const queue = nodes.filter((n) => !incoming.has(n.id)).map((n) => n.id);
  queue.forEach((id) => (depth[id] = 0));
  while (queue.length) {
    const id = queue.shift();
    for (const e of edges.filter((x) => x.from === id)) if (depth[e.to] === undefined) { depth[e.to] = depth[id] + 1; queue.push(e.to); }
  }
  const cols = {};
  for (const n of nodes) (cols[depth[n.id] ?? 0] ??= []).push(n);
  const pos = {};
  for (const [d, arr] of Object.entries(cols)) arr.forEach((n, i) => (pos[n.id] = { x: 30 + d * 270, y: 30 + i * 80 }));
  return pos;
}

function graph(unit, { visits = null, edgeCount = null, selected = null } = {}) {
  const nodes = unit.structure.nodes.filter((n) => state.showAll || unit.layers.includes(n.layer));
  const ids = new Set(nodes.map((n) => n.id));
  const edges = unit.structure.edges.filter((e) => ids.has(e.from) && ids.has(e.to));
  const pos = layout(nodes, edges);
  const W = Math.max(...Object.values(pos).map((p) => p.x)) + 190, H = Math.max(...Object.values(pos).map((p) => p.y)) + 80;
  const svg = h("svg", { svg: true, class: "graph", viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "구조 그래프" });
  svg.append(h("defs", { svg: true }, h("marker", { svg: true, id: "ar", viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, h("path", { svg: true, d: "M0 0L10 5L0 10z", fill: "currentColor" }))));
  for (const e of edges) {
    const a = pos[e.from], b = pos[e.to];
    const n = edgeCount ? edgeCount[`${e.from}>${e.to}`] ?? 0 : 0;
    svg.append(h("line", { svg: true, class: "edge" + (n ? " on" : ""), x1: a.x + 150, y1: a.y + 24, x2: b.x - 4, y2: b.y + 24, "marker-end": "url(#ar)", style: "color:" + (n ? "var(--accent)" : "var(--line)") }));
    if (edgeCount) svg.append(h("text", { svg: true, class: "edgelabel", "text-anchor": "middle", x: (a.x + 150 + b.x) / 2, y: (a.y + b.y) / 2 + 14 }, n ? `${n}번` : "안 지남"));
  }
  for (const n of nodes) {
    const p = pos[n.id], v = visits?.[n.id] ?? 0;
    const cls = "node" + (visits ? (v ? " on" : " off") : "") + (selected === n.id ? " sel" : "");
    const status = visits ? (v ? `✔ ${v}번 실행` : "– 안 지남") : "";
    svg.append(
      h("g", { svg: true, class: cls }, h("title", { svg: true }, `${n.label} (${n.layer}층)${status ? " " + status : ""}`),
        h("rect", { svg: true, x: p.x, y: p.y, width: 150, height: 48, rx: 9 }),
        h("text", { svg: true, x: p.x + 12, y: p.y + 21 }, n.label),
        status ? h("text", { svg: true, x: p.x + 12, y: p.y + 39, style: "font-size:12px" }, status) : null),
    );
  }
  return svg;
}

// ───────────── 실행 기록 → 화면 ─────────────
const visible = (e) => state.showAll || state.unit.layers.includes(e.layer);
function summarize(e) {
  const d = e.data;
  switch (e.type) {
    case "run_start": return ["▶", `실행 시작 · ${d.scenario}`];
    case "turn_start": return ["❓", `질문${d.who ? ` (${d.who})` : ""} · ${clip(d.question, 40)}`];
    case "llm_call": return [d.error ? "✘" : "🤖", d.error ? `모델 호출 실패 · ${clip(d.error, 40)}` : `모델 호출 · 보낸 메시지 ${d.sent.length}개`];
    case "turn_end": return ["💬", `응답 · ${clip(d.answer, 40)}`];
    case "error": return ["✘", `오류 · ${d.name}`];
    case "run_end": return ["■", "실행 끝"];
    default: return ["•", e.type];
  }
}
function msgList(list, newFrom = Infinity) {
  return h("div", {}, list.map((m, i) => h("div", { class: `msg ${m.role}${i >= newFrom ? " new" : ""}` }, h("b", {}, m.role), i >= newFrom ? h("span", { class: "badge ok" }, "이번에 새로") : null, " ", clip(m.content, 160))));
}
function stepOf(run, i) {
  const evs = run.events.filter(visible);
  return { evs, e: evs[i] };
}

function detail(run, evs, i) {
  const e = evs[i];
  if (!e) return h("p", { class: "muted" }, "단계를 고르세요.");
  const d = e.data;
  const next = evs.slice(i + 1).find((x) => x.node);
  const kv = h("dl", { class: "kv" });
  const row = (k, v) => kv.append(h("dt", {}, k), h("dd", {}, v));
  row("단계", `${i + 1} / ${evs.length} · ${e.type}${e.node ? ` · 노드 ${e.node}` : ""}`);
  if (e.type === "turn_start") {
    row("입력", d.question);
    row("실행한 함수", "내가 쓴 ask(history, question) (하네스가 호출)");
    row("State 변경 전", d.stateBefore ? msgList(d.stateBefore) : "(기록 없음)");
  } else if (e.type === "llm_call") {
    const prev = [...run.events.slice(0, e.seq)].reverse().find((x) => x.type === "llm_call" && !x.data.error);
    const same = prev && prev.data.sent.every((m, k) => e.data.sent[k] && e.data.sent[k].role === m.role && e.data.sent[k].content === m.content);
    row("입력", h("div", {}, h("div", { class: "small muted" }, `모델에 보낸 messages ${d.sent.length}개` + (same ? ` (지난 호출보다 ${d.sent.length - prev.data.sent.length}개 늘었다)` : "")), msgList(d.sent, same ? prev.data.sent.length : Infinity)));
    row("실행한 함수", `chat(messages) → ${d.mode === "real" ? "실제 모델" : "fake LLM (결정적)"}`);
    row("도구 결과", "없음 (이 단원에는 도구가 없다)");
    row("모델의 응답", d.error ? h("span", { class: "bad" }, d.error) : msgList([d.reply]));
  } else if (e.type === "turn_end") {
    row("결과", d.answer);
    const before = [...run.events.slice(0, e.seq)].reverse().find((x) => x.type === "turn_start")?.data.stateBefore;
    row("State 변경 전후", h("div", {}, `대화 기록 ${before ? before.length : "?"}개 → ${d.stateAfter ? d.stateAfter.length : "?"}개`, d.stateAfter ? msgList(d.stateAfter, before ? before.length : Infinity) : null));
  } else if (e.type === "error") {
    row("오류", h("span", { class: "bad" }, `${d.name}: ${d.message}`));
    const before = run.events.slice(0, e.seq).some((x) => x.type === "llm_call");
    row("위치", before ? "모델을 부른 뒤에 발생했습니다." : "모델을 부르기 전에 발생했습니다. (내 코드가 chat() 에 닿기 전에 멈춤)");
  }
  row("다음 노드", next ? next.node : "없음 (끝)");
  row("경로를 정한 조건", d.condition ?? "이 단계에는 갈라지는 코드 조건이 없습니다 (질문 → 모델 → 응답으로 이어짐)");
  return kv;
}

// ───────────── 탭 ─────────────
function predictionTable(unit, status) {
  const rows = status.predictions.rows;
  const first = status.predictions.firstMismatch;
  const wrote = status.predictions.writtenBeforeFirstRun;
  return h("div", { class: "card" }, h("h3", {}, "내 예측 vs 실제"),
    wrote === false ? h("div", { class: "note" }, "예측이 첫 실행 뒤에 작성된 것 같습니다. 참고용으로만 보세요. 예측은 실행 전에 적어야 효과가 큽니다.") : null,
    h("table", {}, h("thead", {}, h("tr", {}, ["", "질문", "내 예측", "실제", "이유(내가 쓴 말)"].map((c) => h("th", {}, c)))),
      h("tbody", {}, rows.map((r) => h("tr", {},
        h("td", {}, r.match === undefined ? ICON.none : r.match ? h("span", { class: "ok" }, "✔ 맞음") : h("span", { class: "bad" }, "✘ 달랐음")),
        h("td", {}, `${r.id}. ${r.prompt}`, r.id === first ? h("div", { class: "badge warn" }, "⚠ 처음 달라진 지점") : null),
        h("td", {}, r.guess || h("span", { class: "muted" }, "(안 적음)")),
        h("td", {}, r.actual ?? h("span", { class: "muted" }, "(아직 실행 안 함)")),
        h("td", {}, r.reason || h("span", { class: "muted" }, "-")))))));
}

function tabStructure() {
  const u = state.unit;
  return h("div", {},
    h("div", { class: "card" }, h("h2", {}, u.title), h("p", {}, "이 단원의 핵심: ", h("b", {}, u.concept)), h("p", { class: "muted small" }, "구조 그래프는 프로그램이 이동할 수 있는 경로입니다. 실제로 간 길은 '실제 실행' 탭에서 보세요."), graph(u),
      h("p", { class: "small muted" }, "지금 단원에서 보이는 층: " + u.layers.join(" · "), " ", h("button", { onclick: () => { state.showAll = !state.showAll; render(); } }, state.showAll ? "배운 것만 보기" : "아직 안 배운 것까지 보기"))));
}

function tabRun() {
  const u = state.unit, run = state.run;
  if (!run) return h("div", { class: "card" }, "아직 실행 기록이 없습니다. 터미널에서 npm run check -- u01 또는 npm run play -- u01 을 실행하세요.");
  const { evs } = stepOf(run, 0);
  state.step = Math.min(state.step, evs.length - 1);
  const e = evs[state.step];
  const visits = {}, edgeCount = {};
  let lastNode = null;
  for (const x of run.events.filter((x) => x.node && state.unit.layers.concat(state.showAll ? ["tool", "state", "store", "approval"] : []).includes(x.layer))) {
    if (!["turn_start", "llm_call", "turn_end"].includes(x.type)) continue;
    visits[x.node] = (visits[x.node] ?? 0) + 1;
    if (lastNode) edgeCount[`${lastNode}>${x.node}`] = (edgeCount[`${lastNode}>${x.node}`] ?? 0) + 1;
    lastNode = x.node;
  }
  const status = u.status;
  const mismatchRow = status.predictions.rows.find((r) => r.id === status.predictions.firstMismatch);
  const mismatchDef = u.predictions.find((p) => p.id === mismatchRow?.id);
  const isMismatchEvent = (x) => mismatchDef && mismatchDef.runOf === run.scenario && x.type === "llm_call" && x.data && (mismatchDef.llmIndex < 0 ? x === [...run.events].reverse().find((y) => y.type === "llm_call") : x === run.events.filter((y) => y.type === "llm_call")[mismatchDef.llmIndex]);
  return h("div", {},
    h("div", { class: "card" }, h("h2", {}, "실제 실행 그래프"),
      h("p", { class: "muted small" }, `실행 ID ${run.runId} · ${run.kind} · ${run.impl} · ${run.mode === "real" ? "실제 모델" : "fake LLM"}${run.result ? " · 결과 " + (run.result.pass ? "✔ 통과" : "✘ 실패") : ""}`),
      graph(u, { visits, edgeCount, selected: e?.node })),
    h("div", { class: "card" }, h("h2", {}, "단계별 기록 재생"),
      h("p", { class: "muted small" }, "이전·다음은 저장된 기록만 넘겨 봅니다. 모델 호출이나 예약을 다시 일으키지 않습니다."),
      h("div", { class: "stepper" },
        h("button", { onclick: () => { state.step--; render(); }, disabled: state.step <= 0 }, "◀ 이전"),
        h("b", {}, `${state.step + 1} / ${evs.length}`),
        h("button", { onclick: () => { state.step++; render(); }, disabled: state.step >= evs.length - 1 }, "다음 ▶")),
      h("div", { class: "cols" },
        h("ol", { class: "timeline", role: "listbox", "aria-label": "실행 단계" }, evs.map((x, i) => {
          const [ic, label] = summarize(x);
          return h("li", { role: "option", tabindex: 0, "aria-current": i === state.step ? "true" : "false", onclick: () => { state.step = i; render(); }, onkeydown: (ev) => { if (ev.key === "Enter") { state.step = i; render(); } } },
            h("span", {}, ic), h("span", {}, `${i + 1}. ${label}`), isMismatchEvent(x) ? h("span", { class: "badge warn" }, "⚠ 예측과 달랐던 곳") : null);
        })),
        h("div", {}, detail(run, evs, state.step)))),
    predictionTable(u, status));
}

function tabFail() {
  const u = state.unit;
  const checks = latestChecks();
  if (!checks.length) return h("div", { class: "card" }, "아직 검사 기록이 없습니다. npm run check -- u01 을 실행하세요.");
  return h("div", {}, checks.map(({ meta, rec }) => {
    const r = rec.result;
    const errBefore = rec.events.some((x) => x.type === "error") && !rec.events.some((x) => x.type === "llm_call");
    return h("div", { class: "card" },
      h("h3", {}, r.pass ? h("span", { class: "ok" }, "✔ 통과") : h("span", { class: "bad" }, "✘ 실패"), ` [${r.id}] ${r.title}`),
      h("dl", { class: "kv" },
        h("dt", {}, "기대값"), h("dd", {}, r.expected),
        h("dt", {}, "실제값"), h("dd", {}, r.actual),
        h("dt", {}, "실패한 조건"), h("dd", {}, r.pass ? "-" : meta.title),
        h("dt", {}, "관련 이벤트"), h("dd", {}, rec.events.filter(visible).map((x) => summarize(x)[1]).slice(0, 8).join("  →  ")),
        h("dt", {}, "고칠 곳"), h("dd", {}, h("code", {}, r.where), " (VS Code 에서 Ctrl+클릭)"),
        h("dt", {}, "읽을 개념"), h("dd", {}, h("button", { class: "linkbtn", onclick: () => openDoc(r.concept) }, r.concept))),
      r.error ? h("div", { class: "note" }, errBefore ? "모델을 부르기 전에 코드가 멈췄습니다. (아직 구현하지 않았거나, chat() 에 닿기 전에 오류가 났습니다)" : "실행 도중 오류가 났습니다.") : null,
      h("button", { onclick: () => { selectRun(rec.runId); state.tab = "run"; render(); } }, "이 검사의 실행 기록 보기"));
  }));
}

function tabProgress() {
  const s = state.unit.status;
  const st = (v) => h("span", { class: "badge " + (v === "pass" || v === "done" ? "ok" : v === "partial" ? "warn" : "") }, `${ICON[v === "done" ? "pass" : v] ?? ICON.none} ${LABEL[v]}`);
  return h("div", {},
    h("div", { class: "note" }, "아래 네 가지는 따로 봅니다. 자동 테스트를 통과해도 '이해했다' 가 되지는 않습니다. 설명할 수 있어야 이해한 것입니다."),
    h("div", { class: "card" }, h("h3", {}, "자동 테스트"), st(s.autoTest.state), ` ${s.autoTest.passed}/${s.autoTest.total} 통과`, s.autoTest.failed.length ? h("span", { class: "bad" }, `  실패: ${s.autoTest.failed.join(", ")}`) : null),
    h("div", { class: "card" }, h("h3", {}, "예측과 회고"), `예측 ${s.predictions.answered}/${s.predictions.total} 작성 · 회고 `, st(s.reflection.state), s.reflection.left ? ` (비어 있는 칸 ${s.reflection.left})` : ""),
    h("div", { class: "card" }, h("h3", {}, "응용 문제"), st(s.apply.state), ` ${s.apply.passed}/${s.apply.total} 통과`),
    h("div", { class: "card" }, h("h3", {}, "사용한 힌트"), s.hints.count ? `최대 ${s.hints.max}단계 (${s.hints.count}번 확인)` : "아직 없음", s.solutionViews ? ` · 정답 ${s.solutionViews}번 열람 (괜찮습니다. 닫고 다시 써 보면 됩니다)` : ""),
    predictionTable(state.unit, s));
}

const TABS = [["structure", "구조 그래프"], ["run", "실제 실행 · 기록 재생"], ["fail", "검사 결과 · 실패 설명"], ["progress", "진도"]];
function latestChecks() {
  const seen = new Map();
  for (const r of state.runs) if (r.kind === "check" && !seen.has(r.scenario)) seen.set(r.scenario, r);
  return state.unit.checks.map((meta) => ({ meta, rec: seen.get(meta.id)?.full })).filter((x) => x.rec?.result);
}

function render() {
  const tabs = $("#tabs");
  tabs.replaceChildren(...TABS.map(([id, label]) => h("button", { class: "tab", role: "tab", "aria-selected": String(state.tab === id), onclick: () => { state.tab = id; render(); } }, label)));
  const view = { structure: tabStructure, run: tabRun, fail: tabFail, progress: tabProgress }[state.tab]();
  $("#main").replaceChildren(view);
  $("#rerun").disabled = !state.unit.status;
}

async function loadRuns(keepRun) {
  const list = await api("/api/runs?unit=" + state.unit.id);
  state.runs = list;
  // 검사 탭을 위해 최근 검사 기록 본문을 미리 읽어 둔다
  const latest = new Map();
  for (const r of list) if (r.kind === "check" && !latest.has(r.scenario)) latest.set(r.scenario, r);
  await Promise.all([...latest.values()].map(async (r) => (r.full = await api("/api/runs/" + r.runId))));
  const sel = $("#run");
  sel.replaceChildren(...list.map((r) => h("option", { value: r.runId }, `${r.kind} · ${r.scenario} · ${r.pass === undefined ? "" : r.pass ? "✔" : "✘"} · ${new Date(r.startedAt).toLocaleTimeString()}`)));
  const want = keepRun && list.find((r) => r.runId === keepRun) ? keepRun : (list.find((r) => r.kind !== "experiment") ?? list[0])?.runId;
  await selectRun(want);
}
async function selectRun(id) {
  state.run = id ? await api("/api/runs/" + id) : null;
  state.step = 0;
  if (id) $("#run").value = id;
}

async function init() {
  state.units = await api("/api/units");
  const sel = $("#unit");
  sel.replaceChildren(...state.units.map((u) => h("option", { value: u.id }, u.title)));
  const setUnit = async (id) => { state.unit = state.units.find((u) => u.id === id); await loadRuns(); render(); };
  sel.addEventListener("change", () => setUnit(sel.value));
  $("#run").addEventListener("change", async (e) => { await selectRun(e.target.value); state.tab = "run"; render(); });
  $("#docclose").addEventListener("click", () => $("#doc").close());
  $("#rerun").addEventListener("click", async () => {
    if (!confirm("내 코드(work/)를 fake LLM 으로 다시 검사해 새 실행 기록을 만듭니다.\n(이전/다음 버튼과 달리 실제로 다시 실행합니다. 계속할까요?)")) return;
    $("#rerun").disabled = true; $("#rerun").textContent = "실행 중…";
    const r = await api("/api/rerun?unit=" + state.unit.id, { method: "POST" });
    $("#rerun").textContent = "▶ 새로 실행 (내 코드를 다시 검사)";
    state.units = await api("/api/units");
    state.unit = state.units.find((u) => u.id === state.unit.id);
    await loadRuns(); state.tab = "fail"; render();
    if (r.error) alert(r.error);
  });
  if (state.units.length) await setUnit(state.units[0].id);
  else $("#main").textContent = "단원이 없습니다.";
}
init();

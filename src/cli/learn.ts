import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { ROOT } from "../lib/paths.js";
import { steps, sourceFor } from "../course/steps.js";
import { Draft, bodyOf, numbered, saveDraft, validate, type CodeIssue } from "../course/editor.js";

const work = path.resolve(process.env.COURSE_WORK_DIR ?? path.join(ROOT, "practice"));
const stateFile = path.resolve(process.env.COURSE_PROGRESS_FILE ?? path.join(ROOT, "progress", "course.json"));
fs.mkdirSync(work, { recursive: true });
let index = 0, finalRun = false;
let lastCheck: { index: number; hash: string; passed: boolean } | null = null;
try {
  const state = JSON.parse(fs.readFileSync(stateFile, "utf8"));
  if (Number.isInteger(state.index) && state.index >= 0 && state.index <= steps.length) index = state.index;
  finalRun = index === steps.length && state.finalRun === true;
  lastCheck = state.lastCheck ?? null;
} catch { /* 첫 실행 */ }
const persist = () => {
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify({ index, finalRun, lastCheck, updatedAt: new Date().toISOString() }, null, 2) + "\n");
};
const currentIndex = () => Math.min(index, steps.length - 1);
const file = () => path.join(work, steps[currentIndex()].id + ".ts");
const fingerprint = () => {
  const hash = createHash("sha256");
  for (let i = 0; i <= currentIndex(); i++) {
    const f = path.join(work, steps[i].id + ".ts");
    hash.update(fs.existsSync(f) ? fs.readFileSync(f) : "(아직 없음)");
  }
  return hash.digest("hex");
};
function code() { console.log("[작성 구역 · 줄 번호는 입력하지 않습니다]\n" + numbered(bodyOf(fs.readFileSync(file(), "utf8")))); }
function show() {
  if (index === steps.length) {
    console.log("\n모든 실습을 통과했습니다.");
    console.log(finalRun && lastCheck?.hash === fingerprint() ? "최종 실행 통과. :quit으로 종료하거나 :run으로 다시 실행하세요." : "마지막 과제: :run으로 완성한 서비스를 실행하세요.");
    console.log("문제집: docs/course/09-finish.md"); return;
  }
  if (!fs.existsSync(file())) fs.writeFileSync(file(), sourceFor(steps[index]));
  const s = steps[index];
  console.log(`\n━━ ${index + 1}/${steps.length} · ${s.title} ━━`);
  console.log(`이번에 만드는 기능: ${s.purpose}\n문제: ${s.problem}\n입력: ${s.input}\n기대 결과: ${s.expected}`);
  console.log(`문제집: docs/course/${s.id}.md\n저장 파일: ${file()}`);
  console.log(`[자동 제공 · 수정하지 않는 함수 틀]\n${s.signature} { … }`);
  code();
  console.log(lastCheck?.index === index && lastCheck.hash === fingerprint()
    ? `검사 상태: ${lastCheck.passed ? "통과" : "실패 · 수정 필요"}` : "검사 상태: 현재 코드는 아직 검사하지 않았습니다.");
  console.log("지금 할 일: :check로 현재 실행 결과 보기 → :edit로 수정 → :save하면 자동 검사 → 통과 후 :next");
}
const help = () => console.log(`
[실행 화면]
:show 현재 문제·코드·검사 상태   :check 입력/기대/실제 결과 비교
:try 글  내가 넣은 글로 실행    :edit 현재 코드를 줄 단위로 수정
:hint 같은 문제의 힌트         :next 전체 재검사 후 다음 챕터
:back 이전 챕터                :run 최종 서비스 대화   :quit 종료
[편집 화면]
:list 코드 보기   :set 1 새코드  1번 줄 교체   :insert 2 새코드  2번 앞에 삽입
:delete 2 4  2~4번 삭제   :undo 마지막 편집 취소   :clear 전체 지우기
:paste 여러 줄로 전체 교체(:done으로 입력 끝)   :save 검사·저장·자동 실행
:cancel 편집 취소. :set 등 명령의 줄 번호와 입력하는 코드 사이에는 공백을 넣으세요.
여기는 학습 프로그램입니다. npm이나 PowerShell 명령은 :quit 후 입력합니다.`);
function issues(list: CodeIssue[], saved: boolean) {
  console.log(saved ? "[문법·타입 검사 실패] 저장된 코드를 고쳐야 합니다." : "[저장하지 않았습니다] 작성 중인 코드를 고쳐 주세요. 기존 파일은 그대로입니다.");
  for (const d of list) console.log(`고칠 위치: ${d.bodyLine ? `작성 구역 ${d.bodyLine}번 줄` : `${d.file}${d.line ? ":" + d.line : ""}`}\n이유: ${d.message}`);
  console.log(saved ? ":edit → :set 줄번호 코드 → :save" : ":list로 확인 → :set 줄번호 코드 → :save (되돌리기 :undo, 취소 :cancel)");
}
async function check(options: { all?: boolean; demo?: boolean; input?: string; validated?: boolean } = {}): Promise<boolean> {
  console.log("\n[1/2 문법·타입 검사] 입력한 TypeScript를 확인합니다.");
  const validation = options.validated ? [] : validate(file(), fs.readFileSync(file(), "utf8"));
  if (validation.length) {
    issues(validation, true);
    lastCheck = { index, hash: fingerprint(), passed: false }; finalRun = false; persist(); return false;
  }
  console.log("✔ 문법·타입 정상\n[2/2 실행 검사] 실제 함수에 입력을 넣습니다.");
  const passed = await new Promise<boolean>((resolve) => {
    const args = ["--import", "tsx", "src/course/verify.ts", String(currentIndex())];
    if (!options.all && !options.demo) args.push("--only");
    if (options.demo) args.push("--demo");
    if (options.input !== undefined) args.push("--input", options.input);
    const child = spawn(process.execPath, args, { cwd: ROOT, env: { ...process.env, LLM_MODE: "fake", COURSE_WORK_DIR: work }, stdio: ["ignore", "inherit", "inherit"] });
    const timer = setTimeout(() => { console.log("시간 초과: 반복문 또는 Promise가 끝나는지 확인하세요."); child.kill(); }, 15000);
    child.on("error", e => { clearTimeout(timer); console.log(e.message); resolve(false); });
    child.on("close", status => { clearTimeout(timer); resolve(status === 0); });
  });
  if (options.input === undefined) { lastCheck = { index, hash: fingerprint(), passed }; finalRun = false; persist(); }
  return passed;
}

console.log("MD 문제집 + 터미널 실습 · :help로 명령 확인. 작성과 검사 결과를 이 화면에서 봅니다.");
show();
let draft: Draft | null = null;
let rawMode = false;
let paste: string[] | null = null;
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: Boolean(process.stdin.isTTY) });
function prompt() { rl.setPrompt(paste !== null ? "붙여넣기> " : draft ? "편집> " : "실습> "); rl.prompt(); }
function preview() { if (draft) console.log("[미저장 작성 구역]\n" + numbered(draft.lines)); }
prompt();
for await (const raw of rl) {
  const cmd = raw.trim();
  try {
    if (cmd === ":quit") { if (draft) console.log("미저장 편집은 취소했습니다. 기존 파일은 그대로입니다."); break; }
    if (draft) {
      if (cmd === ":cancel") { draft = null; paste = null; rawMode = false; console.log("입력 취소. 기존 파일은 그대로입니다."); }
      else if (paste !== null) {
        if (cmd === ":done") { draft.replace(paste); paste = null; rawMode = false; preview(); console.log("붙여넣기 완료. :save로 검사·저장하세요."); }
        else if (cmd.startsWith(":")) console.log("여러 줄 입력 중입니다. :done으로 끝내거나 :cancel로 취소하세요.");
        else paste.push(raw);
      } else if (cmd === ":save") {
        console.log("저장 전 문법·타입을 확인합니다…");
        const validation = validate(file(), draft.source);
        if (validation.length) issues(validation, false);
        else {
          saveDraft(file(), draft); draft = null; rawMode = false; finalRun = false; persist();
          console.log("저장했습니다. 저장된 코드를 확인하세요."); code();
          console.log("저장만으로 정답이 되는 것은 아닙니다. 지금 자동으로 실행해 검사합니다.");
          if (await check({ validated: true })) console.log("통과. :try 다른글로 실행해 보거나 :next로 다음 문제로 이동하세요.");
          else console.log("수정 필요. 위의 기대/실제 결과를 비교하고 :edit로 고치세요.");
        }
      } else if (cmd === ":list" || cmd === ":show" || cmd === ":preview") preview();
      else if (cmd === ":undo") { draft.undo(); rawMode = false; preview(); }
      else if (cmd === ":clear") { draft.replace([]); rawMode = false; preview(); }
      else if (cmd === ":paste") { paste = []; console.log("함수 안의 코드만 여러 줄 입력하세요. :done으로 끝냅니다. 전체 본문이 교체됩니다."); }
      else if (/^:set\s/.test(cmd)) {
        const m = raw.match(/^\s*:set\s+(\d+)\s(.*)$/);
        if (!m) throw new Error("사용법: :set 1 return …; (줄번호 다음에 공백과 코드를 입력)");
        draft.set(Number(m[1]), m[2]); rawMode = false; preview();
      } else if (/^:insert\s/.test(cmd)) {
        const m = raw.match(/^\s*:insert\s+(\d+)\s(.*)$/);
        if (!m) throw new Error("사용법: :insert 2 const reply = …;");
        draft.insert(Number(m[1]), m[2]); rawMode = false; preview();
      } else if (/^:delete\s/.test(cmd)) {
        const m = cmd.match(/^:delete\s+(\d+)(?:\s+(\d+))?$/);
        if (!m) throw new Error("사용법: :delete 2 또는 :delete 2 4");
        draft.delete(Number(m[1]), Number(m[2] ?? m[1])); rawMode = false; preview();
      } else if (cmd === ":help") help();
      else if (cmd === ":hint") console.log(steps[index].hint);
      else if (cmd.startsWith(":")) console.log("편집 중입니다. :list / :set / :insert / :delete / :undo / :save / :cancel을 사용하세요. :save하면 자동 검사합니다.");
      else {
        // 이전 버전의 :edit → 여러 줄 입력 → :save 흐름도 지원한다.
        if (!rawMode) { draft.replace([raw]); rawMode = true; console.log("전체 교체 입력 시작. :list로 미리 보고 :save로 검사·저장하세요. 줄 수정은 :set을 사용합니다."); }
        else draft.replace([...draft.lines, raw]);
      }
    } else if (cmd === ":show" || cmd === ":list") show();
    else if (cmd === ":help") help();
    else if (cmd === ":edit" && index < steps.length) {
      draft = new Draft(fs.readFileSync(file(), "utf8")); rawMode = false; preview();
      console.log("기존 코드를 불러왔습니다. 한 줄 수정: :set 1 새코드\n삽입 :insert / 삭제 :delete / 되돌리기 :undo / 여러 줄 전체 교체 :paste\n자동 제공 함수 선언은 입력하지 마세요. 저장·자동 검사는 :save, 취소는 :cancel.");
    } else if (cmd === ":hint" && index < steps.length) console.log(steps[index].hint);
    else if (cmd === ":check") {
      if (await check()) console.log(index < steps.length ? "통과. :try 다른글로 추가 실행하거나 :next로 다음 챕터로 이동하세요." : "전체 재검사 통과. :run으로 최종 대화를 실행하세요.");
    } else if (/^:try(?:\s|$)/.test(cmd)) {
      if (index >= steps.length) console.log("최종 단계에서는 :run을 사용하세요.");
      else if (await check({ input: raw.replace(/^\s*:try\s?/, "") })) console.log("추가 입력 실험 완료. 정답 판정은 :check로 확인합니다.");
    } else if (cmd === ":run") {
      if (index < steps.length) console.log("먼저 8개 실습을 통과하고 :next로 최종 단계에 도착하세요. 지금 코드 실행은 :check 또는 :try 글을 사용합니다.");
      else if (await check({ all: true, demo: true })) { finalRun = true; persist(); console.log("최종 실행 통과. 현재 제공된 실습을 모두 마쳤습니다."); }
    } else if (cmd === ":next" && index < steps.length) {
      if (await check({ all: true })) { index++; finalRun = false; lastCheck = null; persist(); show(); }
      else console.log("아직 이동하지 않았습니다. 표시된 단계의 코드를 고친 뒤 다시 검사하세요.");
    } else if (cmd === ":back") { index = Math.max(0, index - 1); finalRun = false; lastCheck = null; persist(); show(); }
    else if (cmd) console.log("알 수 없는 입력입니다. 코드 작성은 :edit, 실행 결과 확인은 :check, 전체 명령은 :help입니다.");
  } catch (error) { console.log("처리하지 못했습니다: " + (error as Error).message); }
  prompt();
}
rl.close();
console.log("종료했습니다. 다음에 npm run learn을 실행하면 같은 단계에서 이어갑니다. 저장하지 않은 입력은 반영되지 않습니다.");

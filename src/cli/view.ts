/**
 * npm run view — 학습 화면(로컬 브라우저). http://127.0.0.1:4173
 * 이 서버는 내 컴퓨터(127.0.0.1)에서만 열린다.
 *
 * 읽기 전용 API: 실행 기록 · 진도 · 개념 문서
 * 실행 API(POST /api/rerun): 내 코드를 fake LLM 으로 다시 검사한다. 화면의 "새로 실행" 버튼에서만 부른다.
 *   기록 재생(이전/다음)은 저장된 JSON 만 읽으며 모델 호출이나 예약 실행을 일으키지 않는다.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { ROOT, rel, unitDir } from "../lib/paths.js";
import { loadUnit, unitIds } from "../lib/registry.js";
import { computeStatus } from "../lib/status.js";
import { listRuns, readRun } from "../lib/trace.js";

const PORT = Number(process.env.VIEW_PORT ?? 4173);
const VIEWER = path.join(ROOT, "src", "viewer");
const MIME: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8" };

const json = (res: http.ServerResponse, data: unknown, code = 200) => {
  res.writeHead(code, { "Content-Type": MIME[".json"], "Cache-Control": "no-store" });
  res.end(JSON.stringify(data));
};

/** 개념 문서로 열 수 있는 경로: docs/ 와 units/<단원>/ 의 .md 파일. hints/ · solutions/ · work/ 는 열지 않는다 */
function docPath(p: string): string | null {
  const clean = p.split("#")[0].replace(/\\/g, "/");
  if (!clean.endsWith(".md") || clean.includes("..")) return null;
  const abs = path.join(ROOT, clean);
  const r = rel(abs);
  const allowed = r.startsWith("docs/") || /^units\/u\d+[^/]*\/[^/]+\.md$/.test(r) || r === "README.md" || r === "START-HERE.md";
  return allowed && fs.existsSync(abs) ? abs : null;
}

async function api(url: URL, req: http.IncomingMessage, res: http.ServerResponse) {
  const p = url.pathname;
  if (p === "/api/units") {
    const out = [];
    for (const id of unitIds()) {
      const u = await loadUnit(id);
      out.push({
        id: u.id, title: u.title, minutes: u.minutes, concept: u.concept, layers: u.layers, structure: u.structure,
        predictions: u.predictions.map(({ id, prompt, options, runOf, llmIndex }) => ({ id, prompt, options, runOf, llmIndex })),
        checks: u.checks.map(({ id, group, title, concept }) => ({ id, group, title, concept })),
        status: computeStatus(u),
      });
    }
    return json(res, out);
  }
  if (p === "/api/runs") {
    const unit = url.searchParams.get("unit");
    const runs = listRuns().filter((r) => !unit || r.unit === unit).map((r) => ({
      runId: r.runId, unit: r.unit, scenario: r.scenario, kind: r.kind, mode: r.mode, impl: r.impl, startedAt: r.startedAt,
      pass: r.result?.pass, events: r.events.length,
    }));
    return json(res, runs);
  }
  if (p.startsWith("/api/runs/")) {
    const run = readRun(decodeURIComponent(p.slice("/api/runs/".length)));
    return run ? json(res, run) : json(res, { error: "기록이 없습니다" }, 404);
  }
  if (p === "/api/doc") {
    const abs = docPath(url.searchParams.get("path") ?? "");
    return abs ? json(res, { path: rel(abs), text: fs.readFileSync(abs, "utf8") }) : json(res, { error: "열 수 없는 문서입니다" }, 404);
  }
  if (p === "/api/rerun" && req.method === "POST") {
    const id = url.searchParams.get("unit") ?? "";
    if (!unitIds().includes(id) || !fs.existsSync(path.join(unitDir(id), "work"))) return json(res, { error: "작업 폴더가 없습니다. npm run begin 을 먼저 하세요" }, 400);
    const child = spawn(process.execPath, ["--import", "tsx", "src/cli/check.ts", id, "--apply"], { cwd: ROOT, env: { ...process.env, LLM_MODE: "fake" } });
    let log = "";
    child.stdout.on("data", (d) => (log += d));
    child.stderr.on("data", (d) => (log += d));
    child.on("close", (code) => json(res, { code, log }));
    return;
  }
  json(res, { error: "없는 주소" }, 404);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);
    if (url.pathname.startsWith("/api/")) return await api(url, req, res);
    const file = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const abs = path.join(VIEWER, path.normalize(file));
    if (!abs.startsWith(VIEWER) || !fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
      res.writeHead(404);
      return res.end("not found");
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(abs)] ?? "application/octet-stream", "Cache-Control": "no-store" });
    res.end(fs.readFileSync(abs));
  } catch (e) {
    json(res, { error: String((e as Error).message) }, 500);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`학습 화면: http://127.0.0.1:${PORT}   (끄려면 Ctrl+C)`);
});

/**
 * npm run selftest — 이 학습 프로젝트 자체가 제대로 만들어졌는지 확인한다 (유지보수용).
 *   · start/ 의 미완성 코드는 교육용 메시지와 함께 실패한다
 *   · solutions/ 의 정답은 모든 검사를 통과한다
 *   · experiments/ 의 잘못된 코드는 실패한다
 *   · 모든 검사가 실행 기록을 남기고, 기록에 비밀값이 없다
 * 내 진도(progress/)와 실행 기록(runs/)은 건드리지 않고 임시 폴더를 쓴다.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "selftest-"));
process.env.RUNS_DIR = path.join(tmp, "runs");
process.env.PROGRESS_FILE = path.join(tmp, "progress.json");
process.env.LLM_MODE = "fake";
process.env.LLM_API_KEY = "sk-selftest-SECRET-123456";

const { makeImpl } = await import("../lib/harness.js");
const { solutionDir, unitDir } = await import("../lib/paths.js");
const { loadUnit, unitIds } = await import("../lib/registry.js");
const { runChecks } = await import("../lib/runner.js");
const { emit, startRun, endRun, readRun } = await import("../lib/trace.js");

let bad = 0;
const ok = (cond: boolean, label: string, detail = "") => {
  console.log(`${cond ? "✔" : "✘"} ${label}${cond ? "" : `  ← ${detail}`}`);
  if (!cond) bad++;
};

for (const id of unitIds()) {
  const unit = await loadUnit(id);
  console.log(`\n[${id}]`);

  const start = await runChecks(unit, makeImpl(path.join(unitDir(id), "start"), "start"), "check", { groups: ["main"] });
  ok(start.results.every((r) => !r.pass), "start/ 미완성 코드: 모든 기본 검사가 실패한다", start.results.filter((r) => r.pass).map((r) => r.id).join());
  ok(start.results.every((r) => r.error === "LearnerTodoError" && r.actual.includes("TODO")), "  실패 이유가 교육용 TODO 메시지다", start.results.map((r) => r.actual).join(" | "));
  ok(start.results.every((r) => /:\d+$/.test(r.where)), "  고칠 곳이 파일:줄 로 나온다", start.results.map((r) => r.where).join(" | "));

  const sol = await runChecks(unit, makeImpl(solutionDir(id), "solution"), "check", { groups: ["main", "apply"] });
  ok(sol.results.every((r) => r.pass), "solutions/ 정답: 모든 검사 통과", sol.results.filter((r) => !r.pass).map((r) => `${r.id}: ${r.actual}`).join(" | "));

  for (const exp of unit.experiments) {
    const r = await runChecks(unit, makeImpl(path.join(unitDir(id), exp.file), "experiment"), "experiment", { groups: ["main"], tag: exp.id });
    const failed = r.results.filter((x) => !x.pass).map((x) => x.id);
    ok(failed.length > 0, `실험 ${exp.id}: 실패하는 검사가 있다 → ${failed.join(", ")}`, "모두 통과해 버림");
  }

  // 실행 기록: 검사마다 기록이 있고, 같은 runId 로 읽힌다
  const all = [...start.results, ...sol.results];
  ok(all.every((r) => readRun(r.runId)?.result?.runId === r.runId), "검사 결과와 실행 기록이 같은 runId 로 연결된다");
  const solRuns = sol.runs.filter((r) => r.events.some((e) => e.type === "llm_call"));
  ok(solRuns.length === sol.runs.length, "정답 실행마다 llm_call 기록이 실제로 남는다");
}

// 비밀값이 기록에 남지 않는다
startRun({ unit: "selftest", scenario: "redact", kind: "play", impl: "x" });
emit("note", "flow", { text: `key=${process.env.LLM_API_KEY} Bearer abcdefgh12345678` });
const rec = endRun();
const dump = JSON.stringify(rec) + JSON.stringify(readRun(rec.runId));
ok(!dump.includes("SECRET-123456") && !dump.includes("abcdefgh12345678"), "실행 기록에 API 키·토큰이 남지 않는다");

fs.rmSync(tmp, { recursive: true, force: true });
console.log(bad ? `\n✘ 자체 점검 실패 ${bad}건` : "\n✔ 자체 점검 통과 (구조·동작 확인. 교육적 품질은 사람이 풀어 보며 검증해야 합니다)");
process.exit(bad ? 1 : 0);

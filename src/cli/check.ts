/**
 * npm run check -- u01            내 코드(work/)를 검사한다
 * npm run check -- u01 --apply    응용 문제까지 검사한다
 *
 * 실패하면 기대값 · 실제값 · 읽을 개념 · 고칠 곳을 알려 준다. 정답 코드는 보여 주지 않는다.
 */
import path from "node:path";
import { makeImpl } from "../lib/harness.js";
import { rel, unitDir } from "../lib/paths.js";
import { updateUnit } from "../lib/progress.js";
import { loadUnit, resolveUnitId } from "../lib/registry.js";
import { runChecks } from "../lib/runner.js";

const args = process.argv.slice(2);
const id = resolveUnitId(args.find((a) => !a.startsWith("--")));
const withApply = args.includes("--apply");
const unit = await loadUnit(id);
const dir = path.join(unitDir(id), "work");
const impl = makeImpl(dir, "work");

const workExists = (await import("node:fs")).existsSync(dir);
if (!workExists) {
  console.error(`내 작업 폴더가 아직 없습니다. 먼저:  npm run begin -- ${id.split("-")[0]}`);
  process.exit(1);
}

const groups = withApply ? (["main", "apply"] as const) : (["main"] as const);
const { results, runs } = await runChecks(unit, impl, "check", { groups: [...groups] });

console.log(`\n=== ${unit.title} · 검사 ===`);
for (const r of results) {
  console.log(`\n${r.pass ? "✔ 통과" : "✘ 실패"}  [${r.id}] ${r.title}`);
  if (!r.pass) {
    console.log(`   기대값  ${r.expected}`);
    console.log(`   실제값  ${r.actual}`);
    console.log(`   읽을 곳  ${r.concept}`);
    console.log(`   고칠 곳  ${r.where}`);
  }
}

const g = (group: "main" | "apply") => {
  const rs = results.filter((r) => unit.checks.find((c) => c.id === r.id)?.group === group);
  return { passed: rs.filter((r) => r.pass).length, total: rs.length };
};
const main = g("main");
console.log(`\n── 요약: 기본 ${main.passed}/${main.total} 통과${withApply ? ` · 응용 ${g("apply").passed}/${g("apply").total} 통과` : ""}`);
console.log(`── 실행 기록: ${runs.length}개 (학습 화면과 같은 기록)  → npm run view`);
if (main.passed < main.total) console.log(`── 막히면: npm run hint -- ${id.split("-")[0]} 1   (힌트 1단계: 개념)`);
else if (!withApply) console.log(`── 다음: ${rel(path.join(unitDir(id), "06-experiments.md"))} → 오류 실험 후 07-apply.md 순서로 진행하세요.`);
else if (results.every((r) => r.pass)) console.log(`── 다음: ${rel(path.join(unitDir(id), "08-recall-explain.md"))} → reflection.md → FEEDBACK.md → 09-finish.md 순서로 마무리하세요.`);
console.log("── 통과는 '동작을 확인했다' 는 뜻이지 '이해했다' 는 뜻이 아닙니다. predictions.md 와 reflection.md 도 채워 주세요.");

const groupsDone: Record<string, { passed: number; total: number }> = { main };
if (withApply) groupsDone.apply = g("apply");
updateUnit(id, (p) => {
  const now = new Date().toISOString();
  p.firstCheckAt ??= now;
  const prev = p.lastCheck;
  p.lastCheck = {
    at: now,
    groups: { ...(prev?.groups ?? {}), ...groupsDone },
    failed: results.filter((r) => !r.pass).map((r) => r.id),
    runIds: { ...(prev?.runIds ?? {}), ...Object.fromEntries(results.map((r) => [r.id, r.runId])) },
  };
});
void rel;
process.exit(results.every((r) => r.pass) ? 0 : 1);

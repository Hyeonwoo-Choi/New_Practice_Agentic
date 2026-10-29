/**
 * npm run experiment -- u01 e1
 * AI 가 썼다고 가정한 "그럴듯하지만 틀린" 코드를 같은 검사로 돌려 본다. 내 코드(work/)는 건드리지 않는다.
 * 돌리기 전에 predictions.md 에 몇 개가 실패할지 예측해 두세요.
 */
import path from "node:path";
import { makeImpl } from "../lib/harness.js";
import { unitDir } from "../lib/paths.js";
import { updateUnit } from "../lib/progress.js";
import { loadUnit, resolveUnitId } from "../lib/registry.js";
import { runChecks } from "../lib/runner.js";

const [unitArg, expArg] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const id = resolveUnitId(unitArg);
const unit = await loadUnit(id);
const exp = unit.experiments.find((e) => e.id === expArg);
if (!exp) {
  console.error(`실험을 고르세요: ${unit.experiments.map((e) => `${e.id} (${e.title})`).join(" · ")}\n예: npm run experiment -- ${unitArg} ${unit.experiments[0]?.id}`);
  process.exit(1);
}
const impl = makeImpl(path.join(unitDir(id), exp.file), "experiment");
const { results, runs } = await runChecks(unit, impl, "experiment", { groups: ["main"], tag: exp.id });

console.log(`\n=== 실험 ${exp.id}: ${exp.title} ===`);
for (const r of results) {
  console.log(`${r.pass ? "✔ 통과" : "✘ 실패"}  [${r.id}] ${r.title}`);
  if (!r.pass) console.log(`     기대값 ${r.expected}\n     실제값 ${r.actual}`);
}
const failed = results.filter((r) => !r.pass).map((r) => r.id);
console.log(`\n실패한 검사 ${failed.length}개: ${failed.join(", ") || "(없음)"}`);
console.log("이제 실행 기록(npm run view)에서 어느 단계가 이상한지 찾고, reflection.md 에 원인을 적어 보세요.");
updateUnit(id, (p) => {
  (p.experiments ??= {})[exp.id] = { at: new Date().toISOString(), failed, runIds: Object.fromEntries(results.map((r) => [r.id, r.runId])) };
});
void runs;

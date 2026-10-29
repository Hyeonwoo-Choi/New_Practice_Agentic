/**
 * npm run play -- u01
 * 내 코드(work/)로 짧은 시연을 돌려 본다. 검사가 아니라 눈으로 보는 용도.
 * 실행 기록이 남아서 학습 화면(npm run view)에서 같은 실행을 볼 수 있다.
 */
import fs from "node:fs";
import path from "node:path";
import { makeImpl } from "../lib/harness.js";
import { unitDir } from "../lib/paths.js";
import { loadUnit, resolveUnitId } from "../lib/registry.js";
import { endRun, startRun } from "../lib/trace.js";

const id = resolveUnitId(process.argv.slice(2).find((a) => !a.startsWith("--")));
const unit = await loadUnit(id);
const dir = path.join(unitDir(id), "work");
if (!fs.existsSync(dir)) {
  console.error(`먼저 npm run begin -- ${id.split("-")[0]}`);
  process.exit(1);
}
const run = startRun({ unit: id, scenario: "play", kind: "play", impl: "work" });
let failed = false;
try {
  await unit.play(makeImpl(dir, "work"));
} catch (e) {
  failed = true;
  console.error(`\n오류: ${(e as Error).message}`);
}
endRun();
console.log(`\n실행 기록: ${run.runId}  (npm run view 로 단계별로 볼 수 있습니다)`);
process.exit(failed ? 1 : 0);

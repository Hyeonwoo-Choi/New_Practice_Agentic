/**
 * npm run solution -- u01
 * 정답 코드와 해설을 화면에 보여 준다. 보았다는 사실만 기록하고, 진행은 막지 않는다.
 * solutions/ 폴더는 학습 화면에서 따로 열리지 않게 분리해 둔 것이며 보안 장치가 아니다 (우발적 노출을 줄일 뿐).
 */
import fs from "node:fs";
import path from "node:path";
import { rel, solutionDir } from "../lib/paths.js";
import { updateUnit } from "../lib/progress.js";
import { resolveUnitId } from "../lib/registry.js";

const id = resolveUnitId(process.argv.slice(2).find((a) => !a.startsWith("--")));
const dir = solutionDir(id);
console.log("정답을 봅니다. 읽은 뒤에는 정답 화면을 닫고, 내 코드를 처음부터 다시 써 보세요 (회복 경로).");
console.log("그 다음 npm run check 로 확인하면 됩니다. 정답을 봤다는 이유로 막히는 것은 없습니다.\n");
for (const f of fs.readdirSync(dir).sort()) {
  console.log(`\n──────── ${rel(path.join(dir, f))} ────────`);
  console.log(fs.readFileSync(path.join(dir, f), "utf8"));
}
updateUnit(id, (p) => {
  (p.solutionViews ??= []).push(new Date().toISOString());
});

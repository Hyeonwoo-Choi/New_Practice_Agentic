/**
 * npm run hint -- u01 1     1단계: 개념 힌트
 * npm run hint -- u01 2     2단계: 의사코드
 * npm run hint -- u01 3     3단계: 부분 코드
 * 어떤 단계까지 봤는지 progress/progress.json 에 기록한다 (벌점이 아니라 나중에 돌아볼 자료).
 */
import fs from "node:fs";
import path from "node:path";
import { unitDir } from "../lib/paths.js";
import { updateUnit } from "../lib/progress.js";
import { resolveUnitId } from "../lib/registry.js";

const [unitArg, levelArg] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const id = resolveUnitId(unitArg);
const names: Record<string, string> = { "1": "1-concept.md", "2": "2-pseudo.md", "3": "3-partial.md" };
const level = String(levelArg ?? "");
if (!names[level]) {
  console.error("힌트 단계는 1(개념) · 2(의사코드) · 3(부분 코드) 입니다. 예: npm run hint -- u01 1");
  process.exit(1);
}
const file = path.join(unitDir(id), "hints", names[level]);
console.log(fs.readFileSync(file, "utf8"));
updateUnit(id, (p) => {
  (p.hints ??= []).push({ level: Number(level), at: new Date().toISOString() });
});
console.log(`\n(힌트 ${level}단계를 봤다고 기록했습니다.)`);
if (level === "3") console.log("그래도 막히면: 15분 넘게 막혔을 때 npm run solution -- " + id.split("-")[0] + "  (정답을 봐도 진행은 막히지 않습니다)");

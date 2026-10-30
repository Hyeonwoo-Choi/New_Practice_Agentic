/**
 * npm run begin -- u01
 * start/ (검증된 시작 코드)를 work/ 로 복사해 내 작업 폴더를 만든다.
 * 이미 work/ 가 있으면 절대 덮어쓰지 않는다. 새 시작본이 필요하면 work.from-start-<시각>/ 으로 따로 만든다.
 */
import fs from "node:fs";
import path from "node:path";
import { rel, unitDir } from "../lib/paths.js";
import { resolveUnitId } from "../lib/registry.js";

const args = process.argv.slice(2);
const id = resolveUnitId(args.find((a) => !a.startsWith("--")));
const start = path.join(unitDir(id), "start");
const work = path.join(unitDir(id), "work");
if (!fs.existsSync(start)) {
  console.error(`${rel(start)} 가 없습니다.`);
  process.exit(1);
}

if (!fs.existsSync(work)) {
  fs.cpSync(start, work, { recursive: true });
  console.log(`✔ 내 작업 폴더를 만들었습니다: ${rel(work)}`);
  console.log(`  이 폴더의 파일을 고치세요. start/ 는 고치지 않습니다 (되돌릴 때 쓰는 원본).`);
} else if (args.includes("--fresh-copy")) {
  const alt = path.join(unitDir(id), `work.from-start-${new Date().toISOString().replace(/[:.]/g, "-")}`);
  fs.cpSync(start, alt, { recursive: true });
  console.log(`✔ 내 작업은 그대로 두고, 새 시작본을 따로 만들었습니다: ${rel(alt)}`);
} else {
  console.log(`내 작업 폴더가 이미 있어서 건드리지 않았습니다: ${rel(work)}`);
  console.log(`  처음 상태가 필요하면:  npm run begin -- ${id.split("-")[0]} --fresh-copy   (내 작업은 지워지지 않습니다)`);
}
console.log("이 명령은 기존 work 코드를 위한 호환 도구입니다.");
console.log("현재 문제집: START-HERE.md → docs/course/00-start.md. 터미널 풀이 시작: npm run learn");

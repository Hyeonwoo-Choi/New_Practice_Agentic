/**
 * npm run lint:units — 구조 점검. 필수 파일이 있고 비어 있지 않은지만 본다.
 * 교육적 품질은 이 점검으로 알 수 없다 (docs/quality.md).
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT, solutionDir, unitDir } from "../lib/paths.js";
import { loadUnit, unitIds } from "../lib/registry.js";

const REQUIRED = [
  "README.md", "01-problem.md", "02-prereq.md", "03-concept.md", "04-example.md", "predictions.md", "05-implement.md",
  "06-experiments.md", "07-apply.md", "08-recall-explain.md", "misconceptions.md", "reflection.md", "FEEDBACK.md",
  "unit.ts", "hints/1-concept.md", "hints/2-pseudo.md", "hints/3-partial.md",
];
let bad = 0;
const fail = (id: string, msg: string) => { console.log(`✘ ${id}: ${msg}`); bad++; };

for (const id of unitIds()) {
  const dir = unitDir(id);
  for (const f of REQUIRED) {
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) fail(id, `${f} 없음`);
    else if (fs.statSync(p).size < 80) fail(id, `${f} 가 거의 비어 있음`);
  }
  for (const d of ["start", "example", "experiments"]) if (!fs.existsSync(path.join(dir, d))) fail(id, `${d}/ 없음`);
  if (!fs.existsSync(path.join(solutionDir(id), "EXPLANATION.md"))) fail(id, "solutions/ 에 EXPLANATION.md 없음");

  const unit = await loadUnit(id);
  if (!unit.checks.length) fail(id, "검사가 없음");
  if (unit.predictions.length < 3) fail(id, "예측 질문이 3개 미만");
  if (!unit.experiments.length) fail(id, "오류 실험이 없음");
  const mis = fs.readFileSync(path.join(dir, "misconceptions.md"), "utf8");
  if ((mis.match(/^## 오해 \d/gm) ?? []).length !== 3) fail(id, "오해가 정확히 3개가 아님");
  const pred = fs.readFileSync(path.join(dir, "predictions.md"), "utf8");
  for (const p of unit.predictions) if (!new RegExp(`^${p.id}:`, "m").test(pred)) fail(id, `predictions.md 에 ${p.id}: 줄이 없음`);
  for (const c of unit.checks) {
    const docRef = c.concept.split(/\s*#/)[0];
    if (!fs.existsSync(path.join(ROOT, docRef))) fail(id, `검사 ${c.id} 의 개념 문서가 없음: ${docRef}`);
    const anchor = c.concept.split(/\s*#/)[1];
    if (anchor && fs.existsSync(path.join(ROOT, docRef))) {
      const text = fs.readFileSync(path.join(ROOT, docRef), "utf8");
      const slugs = [...text.matchAll(/^#{1,4}\s+(.+)$/gm)].map((m) => m[1].trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-"));
      if (!slugs.includes(anchor)) fail(id, `검사 ${c.id} 의 개념 절 #${anchor} 가 ${docRef} 에 없음`);
    }
    const startFile = path.join(dir, "start", c.todo.file);
    if (!fs.existsSync(startFile) || !fs.readFileSync(startFile, "utf8").includes(`TODO(${c.todo.id})`)) fail(id, `검사 ${c.id}: start/${c.todo.file} 에 TODO(${c.todo.id}) 표시가 없음`);
  }
  if (fs.existsSync(path.join(dir, "work"))) console.log(`  (참고) ${id}/work 는 학습자 폴더라서 점검하지 않았습니다`);
  console.log(`${bad ? "…" : "✔"} ${id} 구조 점검 완료`);
}
console.log(bad ? `\n✘ 구조 문제 ${bad}건` : "\n✔ 구조 점검 통과 (파일이 있다는 뜻일 뿐, 교육적 품질은 사람이 풀어 봐야 압니다 → docs/quality.md)");
process.exit(bad ? 1 : 0);

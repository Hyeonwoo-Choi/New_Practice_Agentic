/** 현재 문제집과 터미널 과정의 순서·내용·로컬 링크를 확인한다. */
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { ROOT } from "../lib/paths.js";
import { steps, sourceFor } from "../course/steps.js";
const pages = ["README.md", "START-HERE.md", "docs/course/00-start.md", ...steps.map(s => "docs/course/" + s.id + ".md"), "docs/course/09-finish.md"];
let links = 0;
for (let i = 0; i < pages.length; i++) {
 const page = pages[i], text = fs.readFileSync(path.join(ROOT, page), "utf8");
 for (const m of text.matchAll(/\]\(([^)]+)\)/g)) {
  const dest = m[1];
  assert(!/^[a-z]+:/i.test(dest), page + ": 본 학습 경로에는 외부 필수 링크를 넣지 않습니다");
  const target = path.resolve(ROOT, path.dirname(page), dest);
  assert(fs.existsSync(target), page + ": 링크 없음 " + dest);
  assert(pages.some(p => path.resolve(ROOT, p) === target), page + ": 본 경로 밖으로 분기합니다 " + dest);
  links++;
 }
 if (i + 1 < pages.length) {
  const expected = path.relative(path.dirname(page), pages[i + 1]).replace(/\\/g, "/");
  assert(text.includes("](" + expected + ")"), page + ": 다음 챕터 링크 없음");
 }
}
for (const [i, s] of steps.entries()) {
 const text = fs.readFileSync(path.join(ROOT, "docs/course", s.id + ".md"), "utf8");
 assert(text.includes(s.title) && text.includes(s.problem) && text.includes(s.expected), s.id + ": 문제 데이터와 문서 불일치");
 assert(text.includes(":edit") && text.includes(":check") && text.includes(":next"));
 assert(sourceFor(s).includes("// EDIT-BEGIN") && sourceFor(s).includes("// EDIT-END"));
 assert(s.hint.length > 0 && s.signature.length > 0);
 assert.equal(s.id.slice(0, 2), String(i + 1).padStart(2, "0"));
}
console.log("✔ 선형 문제집 " + pages.length + "페이지 · 링크 " + links + "개 · 터미널 실습 " + steps.length + "단계 일치");

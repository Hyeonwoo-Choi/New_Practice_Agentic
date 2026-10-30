/** 현재 선형 실습의 저장된 위치를 표시한다. */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../lib/paths.js";
import { steps } from "../course/steps.js";
const file = process.env.COURSE_PROGRESS_FILE ?? path.join(ROOT, "progress", "course.json");
let index = 0;
let finalRun = false;
try { const state = JSON.parse(fs.readFileSync(file, "utf8")); if (Number.isInteger(state.index) && state.index >= 0 && state.index <= steps.length) index = state.index; finalRun = state.finalRun === true; } catch { /* 첫 실행 */ }
console.log(index === steps.length ? (finalRun ? "저장된 위치: 코드 실습과 최종 실행 통과." : "저장된 위치: 8개 코드 실습 통과. :run으로 최종 실행이 남았습니다.") : "저장된 위치: " + (index + 1) + "/" + steps.length + " · " + steps[index].title);
console.log("이 표시는 마지막으로 저장된 이동 위치입니다. 코드 수정 뒤에는 :check로 다시 검사하세요.");
console.log("계속하기: npm run learn");
console.log("문제집: docs/course/" + (index === steps.length ? "09-finish" : steps[index].id) + ".md");

/** npm run status — 단원별 진도를 네 가지로 나눠 보여 준다 */
import { loadUnit, unitIds } from "../lib/registry.js";
import { computeStatus } from "../lib/status.js";

const mark = (s: string) => ({ none: "·  아직", partial: "◐  일부", pass: "●  통과", done: "●  완료" })[s] ?? s;

console.log("\n단원별 진도 (각 항목은 따로 봅니다. 어느 하나도 '이해 완료' 를 뜻하지 않습니다)\n");
for (const id of unitIds()) {
  const s = computeStatus(await loadUnit(id));
  console.log(`■ ${s.title}  (목표 ${s.minutes}분)`);
  console.log(`   자동 테스트     ${mark(s.autoTest.state)}   ${s.autoTest.passed}/${s.autoTest.total}${s.autoTest.failed.length ? `  실패: ${s.autoTest.failed.join(", ")}` : ""}`);
  const pr = s.predictions;
  const when = pr.writtenBeforeFirstRun === null ? "" : pr.writtenBeforeFirstRun ? " · 첫 실행 전에 작성" : " · 첫 실행 뒤에 작성(참고용)";
  console.log(`   예측            ${pr.answered}/${pr.total} 작성${when}`);
  for (const r of pr.rows.filter((r) => r.match !== undefined)) console.log(`      ${r.match ? "✔" : "✘"} ${r.id} 내 예측 ${r.guess} / 실제 ${r.actual}`);
  console.log(`   회고            ${mark(s.reflection.state)}   ${s.reflection.left ? `비어 있는 칸 ${s.reflection.left}` : ""}`);
  console.log(`   응용 문제       ${mark(s.apply.state)}   ${s.apply.passed}/${s.apply.total}`);
  console.log(`   사용한 힌트     ${s.hints.count ? `최대 ${s.hints.max}단계 (${s.hints.count}번 확인)` : "없음"}${s.solutionViews ? ` · 정답 ${s.solutionViews}번 열람` : ""}\n`);
}

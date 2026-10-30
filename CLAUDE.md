# 튜터·유지보수 지침

현재 학습 경로는 README.md → START-HERE.md → docs/course/00-start.md → 01~08 실습 → 09-finish.md입니다.

- 문제집은 MD, 풀이는 npm run learn으로 시작하는 터미널에서 진행합니다.
- 문제·기대 결과·코드 작성·검사·다음 단계 순서를 유지합니다.
- 필기·예측·회고 제출을 요구하지 않습니다. 코드를 작성·실행·수정하는 과제로 이해를 확인합니다.
- 학습자가 문제를 푸는 중에는 practice/의 답을 대신 채우지 말고 같은 문제의 설명과 힌트를 활용하세요. 프로젝트 자체의 재설계·유지보수 요청은 이 제한과 구분합니다.
- practice/와 기존 units/*/work/, progress/의 학습자 기록을 덮어쓰지 않습니다. 터미널 저장은 기존 버전을 .backups에 보존합니다.
- 문법 설명을 별도 학습 분기로 빼지 않습니다. 새 문제를 만들면 필요한 설명을 그 MD 안에 넣습니다. 참고 자료를 꼭 분리해야 한다면 원래 챕터로 돌아가는 링크를 넣고 본 경로의 다음 챕터도 유지합니다.
- 문제 데이터는 src/course/steps.ts, 검사는 src/course/verify.ts, MD 생성은 src/course/write-docs.ts입니다.
- 검사: npm run typecheck, npm run lint:units, npm run selftest:course, npm run selftest.
- docs/archive는 이전 기록 보존용이며 현재 학습 순서가 아닙니다. U02 이후는 아직 제공되지 않습니다.

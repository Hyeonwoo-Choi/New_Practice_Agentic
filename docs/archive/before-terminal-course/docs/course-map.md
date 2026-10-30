# 기존 과정 ↔ 새 과정 대응표

분석한 원본: `D:\dev\Agentic AI\agentic-ai-lecture` (읽기만 했고 수정하지 않았습니다).
원본은 "공군 AI센터 · Agentic AI 1일차" 과정이고, 정비 부품 Agent 를 만들며 **실습 1~22** 를 따라 입력하는 구성입니다. 원본 파일은 `lab/` (실습 코드·도구·합성 데이터) 와 `slides/` (장표 HTML 5개) 입니다.

## 1. 원본의 핵심 학습 목표와 개념, 등장 위치

| 원본 실습 | 개념 | 원본 파일 |
|---|---|---|
| 1 LLM 부르기 | 모델 호출 = HTTP 요청, messages, 토큰·컨텍스트 윈도우 | `lab/am/agent.ts`, `slides/day1-am.html` |
| 2 대화 이어 가기 | messages 에 지난 대화를 붙여 보낸다 | 〃 |
| 3 도구 알려 주기 | 도구 설명(JSON schema), 모델은 "요청"만 한다 | 〃 |
| 4 도구 실행하기 | 도구 요청을 우리 코드가 실행, `role: "tool"` 로 결과 전달 | 〃 |
| 5 도구 하나 더와 루프 | 결과를 보고 다시 모델 호출하는 반복, 종료 조건 | 〃 |
| 6 대체품 도구 | 도구 선택은 설명으로 정해진다, 오류 결과 다루기 | 〃 |
| 7 사람 승인 | 되돌리기 어려운 도구 전에 사람에게 묻기 | 〃 |
| 8~10 Chain · Router · Agent | State · 노드 · 엣지 · 조건 분기, 루프를 그래프로 | `lab/pm/agent.ts`, `slides/day1-pm1-graph.html` |
| 11 멈춤 | 그래프를 멈추는 첫 경험(MAX_STEPS 등) | 〃 |
| 12~13 확인한 사실 · 재고표 | State schema, reducer(이어 붙이기·합치기) | `lab/pm/agent2.ts`, `slides/day1-pm2-state.html` |
| 14 이어서 묻기 | checkpointer(MemorySaver), thread_id | 〃 |
| 15 입구와 출구 | input / output schema | 〃 |
| 16 진행 상황 보기 | stream, streamMode(updates) | `lab/pm/agent3.ts`, `slides/day1-pm3-hitl.html` |
| 17 토큰 스트리밍 | streamMode custom, 토큰 단위 출력 | 〃 |
| 18 청구 전에 멈추기 | breakpoint(interruptBefore), getState, null 로 재개 | 〃 |
| 19 담당자 의견 | updateState, human feedback 노드 | 〃 |
| 20 interrupt 로 묻기 | `interrupt()`, `Command({ resume })`, 재개 시 노드가 처음부터 다시 돈다 | `lab/pm/agent4.ts`, `slides/day1-pm4-control.html` |
| 21 지난 기록 보기 | getStateHistory, replay, fork | 〃 |
| 22 서브그래프 | 그래프를 노드로 꽂기, 필드 이름이 같아야 오간다, `subgraphs: true` | 〃 |

보조 파일: `lab/lib/mock.ts`(실습용 결정적 가짜 모델, 규칙 기반), `lab/lib/llm.ts`(메시지 타입·stream 읽기), `lab/lib/env.ts`, `lab/data/*.json`(정비 계획·재고·대체품 합성 데이터), `lab/tools/{lab,step,sessions}.mjs`(실습 실행·정답 덮어쓰기), `lab/studio/`(LangGraph Studio 로 그래프 보기).

## 2. 개념 간 선수 관계

```
메시지·모델 호출(1,2)
   └─ 도구 설명/요청/실행(3,4) ─ 결과로 반복·종료(5,6)
                                   └─ 노드·엣지·조건 분기(8,9,10)
                                         ├─ State·reducer(12,13,15)
                                         │     └─ checkpointer·thread_id(14)
                                         │            ├─ 스트리밍·관찰(16,17)
                                         │            └─ 사람 승인: 중단·재개(7,11,18,19,20)
                                         │                  ├─ 재개 시 노드 재실행(20 의 슬라이드)
                                         │                  │     └─ 중복 실행 방지(원본에 없음)
                                         │                  └─ 이전 기록·다시 실행(21)
                                         └─ 서브그래프(22)
```

## 3. 새 과정으로의 대응 (유지 · 분리 · 추가 · 생략)

| 새 단원 | 원본 | 처리 | 이유 |
|---|---|---|---|
| U01 메시지와 LLM 호출 | 1, 2 | **유지·재구성** | 원본은 "복사해 넣기"에 가까웠다. "모델은 기억하지 않는다"는 한 개념에 집중하고, 예측·오류 실험을 더함 |
| U02 도구 설명 · 요청 · 실행 | 3, 4 | **분리** | 원본 3(알려 주기)과 4(실행)를 한 개념 "설명 ≠ 요청 ≠ 실행"으로 묶되, 실행 책임이 누구에게 있는지가 핵심 |
| U03 도구 결과와 반복 · 종료 조건 | 5, 6 | **유지** | 루프와 상한(MAX_STEPS)을 직접 구현. 6의 오류 결과 처리는 이 단원 응용으로 |
| U04 노드 · 엣지 · 조건 분기 | 8, 9, 10 | **유지** | Chain→Router→Agent 의 "선 하나 차이"를 직접 바꿔 보게 함 |
| U05 State 와 reducer | 12, 13 (+15 는 응용) | **유지** | 합치기 규칙이 핵심. input/output schema(15)는 응용 문제로 내림 |
| U06 checkpointer 와 thread_id | 14 | **분리** | 원본은 reducer 와 같은 시간. 개념이 달라 따로 (U01 응용의 Map 이 다리 역할) |
| U07 스트리밍과 실행 관찰 | 16, 17 | **유지** | 관찰은 이후 모든 단원의 도구이므로 먼저 |
| U08 사람 승인: 중단과 재개 | 7, 11, 18, 19, 20 | **통합** | 원본이 breakpoint→updateState→interrupt 로 세 번 나눠 가르침. 새 과정은 `interrupt`/`Command` 한 개념으로 정리하고 breakpoint 는 비교로만 |
| U09 재개 시 노드 재실행 | 20 의 슬라이드 "이어 가면 노드가 처음부터 다시 돈다" | **분리** | 원본은 한 장표. 사고(중복 부작용)로 이어지는 핵심이라 별도 단원 |
| U10 중복 실행 방지 | (없음) | **추가** | 요구사항 확장. 재개·재시도에도 예약이 한 번만 |
| U11 이전 실행 기록 확인과 다시 실행 | 21 | **유지** | getStateHistory, replay, fork |
| U12 서브그래프 | 22 | **유지** | 예약 요약 기능 분리 |
| U13 (선택) 병렬 실행과 합류 | 슬라이드 "다시 보기 — 동시에 돌리고 합류하기" | **선택으로 이동** | 핵심 경로 밖. 시간이 남을 때 |
| U14 최종 전이: 장비 대여 도우미 | (없음) | **추가** | 다른 도메인에서 처음부터 구성해야 이해가 옮겨 갔는지 확인 가능 |
| U00 진단 + 보충 S1~S3 | (없음) | **추가** | 원본은 TS·async·HTTP 를 안다고 가정. 이 학습자는 그렇지 않음 |
| MCP(도구 표준 규격) | 오전 장표 | **생략** | 핵심 경로에 필요 없음. 후속 과정 후보 |
| zod 검증, MessagesAnnotation, trim/요약, 외부 메모리 | pm2 장표 | **생략** | 개념 과다. U05/U06 이후 "더 알아보기"로 |
| LangGraph Studio (`lab/studio`) | — | **대체** | 자체 학습 화면(`npm run view`)이 실제 실행 기록을 보여 준다. 외부 도구 설치 불필요 |
| 정비 부품 도메인, 공군 맥락 | `lab/data/*` | **대체** | 스터디룸 예약. 일상적이라 도메인 설명 부담이 적다 |
| Codespaces / devcontainer, `pnpm step`(정답 덮어쓰기) | `.devcontainer`, `tools/step.mjs` | **대체** | 로컬 실행. 정답을 덮어쓰는 대신 `start/` → `work/` 복사와 `solutions/` 분리로 **내 코드를 보존** |
| 실제 모델 필수(cloud 키) | `lab/lib/env.ts` | **변경** | fake 가 기본, 실제 모델은 선택 |

## 4. 원본 검증 도구에 대한 확인

- **원본 `lab/tools/` 에 `check.mjs` 는 없습니다.** (`lab.mjs`, `sessions.mjs`, `step.mjs` 만 있음)
- 참고로 현재 작업 중인 `airforce-agentic-ai` 저장소의 `tools/check.mjs` 는 실행 후 **화면 출력 문자열을 정규식으로 찾는** 방식입니다 (예: `/SUB\s*\]\s*┏━ askRadar/`). 이 방식은 문구를 외워 맞출 수 있고 동작 자체를 검증하지 못해 **재사용하지 않았습니다**.
- 대신 새로 만든 검사(`src/lib/runner.ts`)는 모델 호출 기록(무엇을 보냈나), 돌려준 기록, 상태 변화를 직접 검사합니다. 재사용한 것은 아이디어 두 가지뿐입니다: "실패 시 힌트를 준다", "앞 단계가 안 되면 뒤 단계 안내".
- 원본 `mock.ts` 의 *결정적 가짜 모델* 아이디어는 `src/lib/fake-llm.ts` 로 이어받았으나, 원본 mock 은 규칙으로 *학습자가 할 일을 대신 흉내 내는 부분*이 있어(예: 도구를 요청하고 결과를 못 받으면 지어내서 답함) 그대로 쓰지 않았습니다. 새 fake 는 "받은 messages 만 본다, 기억이 없다"를 지킵니다.

## 5. 패키지 호환성

원본 `lab/package.json` 의 `@langchain/core 1.2.14` + `@langchain/langgraph 1.4.18` (peer `@langchain/core ^1.1.48`)을 **정확히 같은 버전으로 고정**했고 `package-lock.json` 을 포함했습니다. `typescript 5.9.3`, `tsx 4.23.15`, `@types/node 22.20.5` 도 고정. U01 은 LangGraph 를 아직 쓰지 않습니다 (U04 부터). `npm run selftest` 가 U04 도입 전 호환성 점검 항목을 추가할 자리입니다 → [open-items.md](open-items.md).

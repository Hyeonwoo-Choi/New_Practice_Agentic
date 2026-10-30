# U01 · 메시지와 LLM 호출

> **지금 하는 일: 안내 · 읽기만**
>
> 먼저 [작성 위치 안내](00-workspace.md)를 여세요. 처음에는 이 안내 문서를 수정할 필요가 없습니다.

**이렇게 생각해 보세요:** “질문에 답하세요”는 터미널에 답을 치라는 뜻이 아닙니다. 예측은 predictions.md, 설명은 reflection.md, 코드는 work/의 .ts 파일에 씁니다.

[작성 위치 안내](00-workspace.md) · [단원 목차](README.md) · [실행 예제](example/ex2-followup.ts)

---


> **이 단원의 핵심 개념은 하나입니다.** 모델은 기억하지 않는다. 호출할 때마다 보낸 `messages` 가 대화의 전부다.

- 목표 시간: **45분 이내** (아래 표 합계). 아직 사람이 풀어 본 측정값이 아닙니다 → [FEEDBACK.md](FEEDBACK.md) 에 실제 시간을 적어 주세요.
- 직접 쓰는 코드: 약 **20줄** (`work/conversation.ts` 와 `work/apply.ts`)
- 필요한 것: Node 22 이상, `npm install` 완료. API 키는 **필요 없습니다** (fake LLM 이 답합니다)
- 선수 지식: 객체·배열·함수, `async/await`, JSON 이 낯설면 먼저 [진단 문제](../../docs/foundations/00-diagnostic.md) 를 풀고 안내된 보충 단원을 읽으세요.

## 진행 순서 (이 순서를 지키세요)

흐름이 안 잡히면 [03-concept.md](03-concept.md)의 **공책 비유와 단계별 표**를 읽고, [04-example.md](04-example.md)의 두 예제를 비교하세요. 첫 예제는 답을 받고 끝나고, 두 번째는 답을 저장한 뒤 이어 묻습니다. 전체 프로젝트 구조를 먼저 외울 필요는 없습니다.

| 순서 | 할 일 | 문서 / 명령 | 목표 |
|---|---|---|---|
| 0 | 작업 폴더 만들기 | `npm run begin -- u01` | 1분 |
| 1 | 문제 만나기 | [01-problem.md](01-problem.md) | 2분 |
| 2 | 선수 지식 | [02-prereq.md](02-prereq.md) | 3분 |
| 3 | 개념 | [03-concept.md](03-concept.md) | 5분 |
| 4 | 작동하는 예시 읽기 | [04-example.md](04-example.md) | 4분 |
| 5 | **예측 쓰기 (실행 전!)** | [predictions.md](predictions.md) 의 P1~P3 | 2분 |
| 6 | 직접 구현 + 검사 | [05-implement.md](05-implement.md) → `npm run check -- u01` | 10분 |
| 7 | 예측 확인, 학습 화면 보기 | `npm run view` | 2분 |
| 8 | 오류 실험 e1 (AI 가 쓴 코드 리뷰) | [06-experiments.md](06-experiments.md) (e2 는 선택 심화 +4분) | 4분 |
| 9 | 응용 문제 | [07-apply.md](07-apply.md) → `npm run check -- u01 --apply` | 5분 |
| 10 | 회상 + 자기 말로 설명 (필수 칸 1·2·3·5·7) | [08-recall-explain.md](08-recall-explain.md), [reflection.md](reflection.md) | 5분 |
| 11 | 기록 남기기 | [FEEDBACK.md](FEEDBACK.md) | 2분 |
| | **합계** | | **45분** |

막히면: `npm run hint -- u01 1` (개념) → `2` (의사코드) → `3` (부분 코드). 그래도 15분 넘게 막히면 `npm run solution -- u01` 로 정답을 봐도 됩니다. 정답을 닫고 다시 직접 써 보세요.

흔한 오해와 그걸 확인하는 질문: [misconceptions.md](misconceptions.md)

## 이 단원이 끝났을 때

- [ ] 모델을 부를 때 `messages` 에 무엇이 들어가는지 그림 없이 말할 수 있다
- [ ] 후속 질문을 이해하려면 왜 지난 답까지 보내야 하는지 설명할 수 있다
- [ ] 위 두 가지를 "스터디룸" 말고 다른 예(번역 도우미, 일정 도우미)에 적용해 설명할 수 있다

---

**챕터 1 / 13 · 단원 소개**

**[다음 챕터: 작성 위치 안내 →](00-workspace.md)**

어디를 읽고 어디에 쓸지 확인하세요.

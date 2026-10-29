# New Practice Agentic — 스터디룸 예약 도우미로 배우는 Agentic AI

코드를 따라 치는 대신, **개념을 이해하고 핵심 코드를 직접 쓰고 다른 상황에 적용하는** 학습 프로젝트입니다.
TypeScript · LangGraph.js. 외부 서비스와 API 키 없이 시작할 수 있습니다.

> **처음이라면 → [START-HERE.md](START-HERE.md)**

## 여기서 배우는 것

모델 호출과 messages → 도구(설명·요청·실행) → 반복과 종료 → 노드·엣지·분기 → State·reducer → checkpointer·thread_id → 스트리밍 → 사람 승인(중단·재개) → 재개 시 재실행 → 중복 실행 방지 → 실행 기록과 다시 실행 → 서브그래프 → 다른 도메인(장비 대여)으로 전이.
전체 계획과 시간: [docs/curriculum.md](docs/curriculum.md) · 기존 과정과의 대응: [docs/course-map.md](docs/course-map.md)

## 설치와 시작 (PowerShell)

```powershell
cd D:\dev\New_Practice_Agentic
npm install
npm run selftest          # 프로젝트가 정상인지 (모두 ✔)
npm run begin -- u01      # 내 작업 폴더 만들기
```

그다음 [units/u01-messages/README.md](units/u01-messages/README.md) 를 여세요.

## 명령

| 명령 | 하는 일 |
|---|---|
| `npm run begin -- u01` | `start/` 를 `work/` 로 복사해 내 작업 폴더 생성 (있으면 건드리지 않음) |
| `npm run play -- u01` | 내 코드 시연 (눈으로 확인) |
| `npm run check -- u01` | 자동 검사. 실패하면 기대값·실제값·읽을 개념·고칠 곳 |
| `npm run check -- u01 --apply` | 응용 문제 검사 |
| `npm run experiment -- u01 e1` | AI 가 쓴 "그럴듯하지만 틀린" 코드를 같은 검사로 돌려 보기 |
| `npm run view` | 학습 화면 http://127.0.0.1:4173 (구조 그래프 · 실제 실행 · 기록 재생 · 실패 설명 · 진도) |
| `npm run hint -- u01 1` | 힌트 1(개념) · 2(의사코드) · 3(부분 코드). 본 단계를 기록 |
| `npm run solution -- u01` | 정답과 해설 (봤다는 기록만 남고 진행은 막지 않음) |
| `npm run status` | 진도: 자동 테스트 · 예측/회고 · 응용 · 힌트를 따로 표시 |
| `npm run lint:units` | (유지보수) 단원 구조 점검 |
| `npm run selftest` | (유지보수) 정답 통과·미완성 실패·실험 실패·기록에 비밀값 없음 |
| `npm run typecheck` | 타입 검사 |

## 폴더

```
START-HERE.md  README.md  CLAUDE.md(튜터 규칙)
docs/          course-map · curriculum · unit-template · ai-guide · quality · open-items · foundations/(진단·보충)
units/uNN-*/   단원 (문서·시작 코드·검사·힌트·실험).  work/ = 내 코드(도구가 덮어쓰지 않음)
solutions/     정답과 해설 (학습 화면의 일반 탐색에서 분리. 보안 장치가 아닌 우발적 노출 방지용)
src/           lib(fake LLM·실행 기록·검사 실행기) · cli(명령) · viewer(학습 화면)
data/          교육용 합성 데이터 (스터디룸). 실제 시설·예약과 무관
progress/      내 진도 기록.  runs/ = 실행 기록(다시 만들 수 있음)
```

## 예측 기록 · 힌트 · 다음 단원

- **예측**: `units/<단원>/predictions.md` 에 `P1: 값 | 이유: …` 형식으로 **실행 전에** 적습니다. `npm run status` 와 학습 화면이 실제 실행 기록과 비교해 줍니다 (처음 달라진 지점 표시).
- **힌트**: 1(개념) → 2(의사코드) → 3(부분 코드) → 15분 막히면 정답. 정답을 봤으면 닫고 다시 씁니다.
- **다음 단원**: 이전 단원을 끝내지 못했어도 다음 단원의 `start/` 는 앞 단원 정답 위에서 만들어진 검증된 코드라서 `npm run begin -- u02` 로 바로 시작할 수 있습니다. 내 이전 `work/` 는 그대로 남습니다. (U02 이후는 아직 제공 전: [docs/open-items.md](docs/open-items.md))

## fake LLM 과 실제 LLM

| | fake (기본) | 실제 (선택) |
|---|---|---|
| 필요한 것 | 없음 | `.env` 에 `LLM_MODE=real`, `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL` (OpenAI 호환) |
| 답 | 항상 같음(결정적). 받은 messages 만 본다 — 기억 없음 | 표현·도구 선택이 매번 달라질 수 있음 |
| 자동 검사 | 정확한 값까지 검사 | 필수 조건(예: 승인 없이 예약 안 함)은 계속 검사. 문구 비교는 안 함 |
| 비용·위험 | 없음 | 비용 발생. 키는 `.env` 에만 (`.gitignore` 로 제외), 실행 기록에서 가려짐 |

> 실제 LLM 연결 코드(`src/lib/llm.ts`)는 있지만 이번에 **키가 없어 실행해 보지 않았습니다.**

## 라이선스 · 데이터

방 이름·가격·예약 현황은 모두 **교육용 합성 데이터**입니다. 실제 예약이나 결제는 일어나지 않습니다.

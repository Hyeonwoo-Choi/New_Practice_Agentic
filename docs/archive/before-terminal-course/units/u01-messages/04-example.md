# 4. 작동하는 예시 읽기 (빈 화면에서 시작하지 않기 위해)

> **지금 하는 일: 예제 읽기·실행 · 필수 작성 없음**
>
> [첫 호출 코드](example/ex1-single-call.ts) → [이어 묻기 코드](example/ex2-followup.ts)를 읽으세요. 바꿔서 실험할 코드는 [scratch.ts](example/scratch.ts)에 적습니다.

**이렇게 생각해 보세요:** messages는 공책 전체, firstReply는 모델이 돌려준 쪽지 하나, firstReply.content는 쪽지에 적힌 글입니다. 쪽지를 받는 것과 공책에 붙이는 것은 다른 작업입니다.

[작성 위치 안내](00-workspace.md) · [단원 목차](README.md) · [실행 예제](example/ex2-followup.ts)

---


[example/ex1-single-call.ts](example/ex1-single-call.ts)를 읽으세요. 모델을 **한 번** 부르고, 호출 전후 기록을 출력하는 프로그램입니다. 실행 전에 아래 질문의 답을 예상해 보세요.

```bash
npx tsx units/u01-messages/example/ex1-single-call.ts
```

## 읽으면서 답해 보기 (노트에 한 줄씩)

1. `messages` 배열에 들어 있는 것은 몇 개이고, 각각 role 이 무엇인가?
2. `await chat(messages)` 에서 `await` 를 빼면 `reply` 는 무엇이 되나?
3. “기록의 메시지 개수”는 몇을 찍을까? `chat`은 `messages`에 답을 붙여 줄까? **실행하기 전에 예상**해 보고 실행하세요.
4. 이 프로그램으로 두 번째 질문("그중 가장 저렴한 곳은?")을 이어서 하려면, 어느 줄 뒤에 무엇이 더 필요한가?

3번이 이 단원의 핵심 힌트입니다. 답: `chat` 은 `messages` 를 **읽기만** 합니다. 답을 붙여 두는 일은 우리 몫입니다.

## 이 예시와 오늘 만들 것의 관계

### 답을 저장하고 이어 묻는 예제

[example/ex2-followup.ts](example/ex2-followup.ts)를 여세요. 날짜와 예약 처리는 생각하지 말고 아래 순서만 따라가세요.

```text
system + 첫 질문 → chat → 첫 답을 받음
                              ↓
                         기록에 답 추가
                              ↓
                 후속 질문을 기록에 추가
                              ↓
              기록 전체 → chat → 두 번째 답
```

실행 전에 두 가지만 예상해 보세요.

- 두 번째 호출에 보내는 메시지는 몇 개일까요?
- 새 기록으로 “그중 가장 저렴한 곳은?”만 물으면 답할 수 있을까요?

```powershell
npx tsx units/u01-messages/example/ex2-followup.ts
```

출력의 1~5번을 코드 주석의 1~5번과 비교하세요. 마지막에는 이전 기록이 없는 경우를 보여 줍니다.

| 이름 | 담기는 것 | 예 |
|---|---|---|
| `messages` | 메시지 여러 개를 담은 배열 | `[system 메시지, user 메시지, …]` |
| `reply` | 모델이 반환한 메시지 객체 하나 | `{ role: "assistant", content: "추천한 방들…" }` |
| `reply.content` | 메시지의 글만 | `"추천한 방들…"` |

기록에는 `messages.push(firstReply)`로 **객체 전체**를 추가하고, 화면에는 `firstReply.content`로 **글**을 보여 줍니다.

두 예제는 항상 **연습용 모델(fake)**로 실행됩니다. 자유롭게 대화하는 AI가 아니라 “4명” 같은 인원과 “저렴” 같은 표현에 반응하는 프로그램입니다. 방과 가격은 연습 데이터이며, 날짜별 빈방 조회나 실제 예약은 하지 않습니다.

### 이제 함수로 묶기

두 번째 예제에서 순서대로 쓴 일을 다음 단계에서 재사용할 함수로 묶습니다. 예제의 `push`는 원본 배열을 바꾸지만, 직접 구현하는 `ask`는 **`[...history, 새메시지]`로 새 배열을 만드는 조건**이 있습니다. [03-concept.md](03-concept.md)의 설계 설명을 참고하세요.

| 예시 | 오늘 만들 것 |
|---|---|
| `messages` 를 손으로 한 번 만든다 | `newConversation()` 과 `ask()` 가 만들어 준다 |
| 답을 받고 끝난다 | 답을 기록에 붙여서 다음 질문에 쓴다 |
| 질문이 하나 | 질문이 이어진다 |

이제 [predictions.md](predictions.md)에 P1~P3을 적고 [05-implement.md](05-implement.md)로 넘어가세요.

---

**챕터 6 / 14 · 작동하는 예제 따라가기**

[← 이전 챕터: 대화 기록 이해하기](03-concept.md)

**[다음 챕터: 실행 전 예상 적기 →](predictions.md)**

이 파일의 P1·P2·P3에 예상값과 이유를 쓰세요.

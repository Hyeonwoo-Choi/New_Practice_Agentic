# 6. 오류 실험: AI 가 쓴 코드를 리뷰하기

> **지금 하는 일: 잘못된 코드 관찰 · 코드 수정 없음**
>
> e1 코드를 읽기 → [predictions.md](predictions.md)의 P4 작성 → 터미널 명령 실행 → [reflection.md](reflection.md)의 3번 작성 순서입니다.

**이렇게 생각해 보세요:** 받은 택배(모델 답)를 보관함(messages)에 넣지 않은 상황입니다. 택배는 도착했지만 다음 사람이 보관함을 열면 없습니다. 실험의 실패는 관찰할 결과이므로 실험 코드를 고치지 않습니다.

[작성 위치 안내](00-workspace.md) · [단원 목차](README.md) · [실행 예제](example/ex2-followup.ts)

---


바이브코딩으로 받은 코드가 **그럴듯해 보이지만 틀린** 경우를 연습합니다. 아래 두 코드는 "AI 가 써 줬다"고 가정한 것입니다.

> 규칙: **돌리기 전에** 코드를 읽고, 어디가 이상한지와 몇 개의 검사가 실패할지(P4, P5) 예측합니다. 그 다음에 돌립니다. 내 `work/` 는 건드리지 않습니다.

## 실험 e1 — 답을 기록에 붙이지 않는다

[experiments/e1-forget-reply/conversation.ts](experiments/e1-forget-reply/conversation.ts)

읽으면서 생각할 것:
- 첫 질문은 정상으로 보일까? 두 번째 질문은?
- `return { messages, answer: reply.content }` 에서 `messages` 에 assistant 답이 들어 있는가?

예측: `predictions.md` 의 **P4**.

```bash
npm run experiment -- u01 e1
```

## 실험 e2 — 전역 변수에 기록을 둔다 (선택 심화)

[experiments/e2-global-history/conversation.ts](experiments/e2-global-history/conversation.ts)

읽으면서 생각할 것:
- 대화를 **하나만** 할 때는 잘 돌아갈까?
- `newConversation()` 을 두 번 부르면? 사용자가 두 명이면?
- 맨 위 `const log` 는 몇 번 만들어지나?

예측: `predictions.md` 의 **P5**.

```bash
npm run experiment -- u01 e2
```

## 실행 뒤에 할 일

1. `npm run view` → 실행 기록 목록에서 `experiment · e1.…` 을 골라 단계를 하나씩 넘겨 보세요. **어느 모델 호출에서 `messages` 가 내 예상과 달랐는지** 찾으세요.
2. [reflection.md](reflection.md) 의 3번(필수), 4번(e2 를 했다면) 칸에 원인을 자기 말로 쓰세요.
3. 실패 메시지의 "읽을 개념" 링크로 [03-concept.md](03-concept.md) 해당 절을 다시 읽어 보세요.

## 이 연습이 알려 주는 것

- "한 번 돌려 보니 답이 나온다" 는 코드가 맞다는 증거가 아닙니다.
- 검사는 문구가 아니라 **모델에 무엇을 보냈는가** 를 봅니다. 그래서 AI 가 쓴 코드의 숨은 결함이 드러납니다.


---

[← 이전](05-implement.md) · [작성 위치 안내](00-workspace.md) · [다음 → 07-apply.md](07-apply.md)

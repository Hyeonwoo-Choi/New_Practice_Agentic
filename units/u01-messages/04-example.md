# 4. 작동하는 예시 읽기 (빈 화면에서 시작하지 않기 위해)

[example/ex1-single-call.ts](example/ex1-single-call.ts) 를 읽으세요. 모델을 **한 번** 부르는 10줄짜리 프로그램입니다.

```bash
npx tsx units/u01-messages/example/ex1-single-call.ts
```

## 읽으면서 답해 보기 (노트에 한 줄씩)

1. `messages` 배열에 들어 있는 것은 몇 개이고, 각각 role 이 무엇인가?
2. `await chat(messages)` 에서 `await` 를 빼면 `reply` 는 무엇이 되나?
3. 마지막 줄 `console.log(messages.length)` 는 몇을 찍을까? `chat` 은 `messages` 에 답을 붙여 줄까? **실행하기 전에 예상**해 보고 실행하세요.
4. 이 프로그램으로 두 번째 질문("그중 가장 저렴한 곳은?")을 이어서 하려면, 어느 줄 뒤에 무엇이 더 필요한가?

3번이 이 단원의 핵심 힌트입니다. 답: `chat` 은 `messages` 를 **읽기만** 합니다. 답을 붙여 두는 일은 우리 몫입니다.

## 이 예시와 오늘 만들 것의 관계

| 예시 | 오늘 만들 것 |
|---|---|
| `messages` 를 손으로 한 번 만든다 | `newConversation()` 과 `ask()` 가 만들어 준다 |
| 답을 받고 끝난다 | 답을 기록에 붙여서 다음 질문에 쓴다 |
| 질문이 하나 | 질문이 이어진다 |

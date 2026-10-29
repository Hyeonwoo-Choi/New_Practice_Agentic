# 7. 응용: 두 사용자의 대화가 섞이지 않게

조건이 바뀝니다. 이제 서비스에 **alice 와 bob** 이 번갈아 말을 겁니다.

```
alice: 내일 오후에 4명이 쓸 방 찾아 줘
bob:   그중 가장 저렴한 곳은?        ← bob 은 방을 찾은 적이 없다
alice: 그중 가장 저렴한 곳은?        ← alice 는 방금 방 목록을 받았다
```

기대하는 동작:
- bob 의 질문에는 모델이 "무엇을 말하는지 모른다" 고 답한다 (bob 의 messages 에 alice 의 대화가 없으므로)
- alice 의 후속 질문은 이해한다
- 두 사람 모두 `system` 안내문이 맨 앞에 정확히 한 번 있다

## 할 일

`work/apply.ts` 의 `createChatService()` 를 완성하세요 (`TODO(U01-3)`). 앞에서 만든 `newConversation` 과 `ask` 를 **그대로** 쓰면 됩니다. 새로 배우는 문법은 `Map` 하나뿐입니다.

```ts
const m = new Map<string, number>();
m.set("alice", 3);
m.get("alice");   // 3
m.get("bob");     // undefined  ← 없는 키는 undefined
```

## 도움 수준 (의도적으로 줄였습니다)

- 이 문제는 **힌트 1단계(개념)** 만 준비돼 있습니다. 의사코드와 부분 코드는 없습니다.
- 막히면 03-concept.md 의 "messages 는 대화 전체다" 를 다시 읽고 이렇게 물어 보세요: *"alice 의 기록을 어디에 둬야 bob 이 못 볼까?"*
- 그래도 안 되면 정답을 봐도 됩니다. 단 닫고 다시 쓰세요.

## 확인

```bash
npm run check -- u01 --apply
```

## 생각해 볼 것 (reflection.md 5번)

- 이 서비스가 **재시작되면** alice 의 기록은 어떻게 될까? (힌트: 지금은 메모리에만 있다. 이 문제는 U06 에서 `thread_id` 와 checkpointer 로 다시 만납니다.)

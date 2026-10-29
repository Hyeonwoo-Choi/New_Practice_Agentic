# 힌트 3단계 — 부분 코드

`___` 자리를 채우세요. 정답 전체가 아니라 뼈대입니다.

```ts
export function newConversation(): Message[] {
  return [ ___ ];                       // system 메시지 객체 하나 (role, content)
}

export async function ask(history: Message[], question: string): Promise<Turn> {
  const sendList: Message[] = [ ...___, ___ ];     // history 뒤에 user 메시지
  const reply = ___ chat(sendList);                // 기다려야 한다
  return { messages: [ ...___, ___ ], answer: ___ };
}
```

- 첫 `___` 에는 `{ role: "system", content: buildSystemPrompt() }` 모양이 들어갑니다.
- `answer` 에 들어갈 값: `reply` 의 어느 속성인가요?

그래도 막히면 15분이 지났는지 확인하고 `npm run solution -- u01` 을 봐도 됩니다. 보고 나서는 **닫고** 처음부터 다시 쓰세요.

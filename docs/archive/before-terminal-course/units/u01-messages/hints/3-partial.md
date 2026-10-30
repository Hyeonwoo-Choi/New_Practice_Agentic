# 힌트 3단계 — 부분 코드

> **힌트는 읽는 곳입니다.** 여기에 답을 쓰지 마세요. 실제 코드는 [work/conversation.ts](../work/conversation.ts)의 해당 TODO 안에 씁니다. work가 없으면 `npm run begin -- u01`을 실행하세요.

[작성 위치 안내](../00-workspace.md) · [구현 안내로 돌아가기](../05-implement.md)


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

---

**보조 경로 · 부분 코드 힌트**

[← 이전 힌트: 순서 힌트](2-pseudo.md)

**[기본 코드 구현 챕터로 돌아가기 →](../05-implement.md)**

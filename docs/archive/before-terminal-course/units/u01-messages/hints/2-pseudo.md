# 힌트 2단계 — 의사코드

> **힌트는 읽는 곳입니다.** 여기에 답을 쓰지 마세요. 실제 코드는 [work/conversation.ts](../work/conversation.ts)의 해당 TODO 안에 씁니다. work가 없으면 `npm run begin -- u01`을 실행하세요.

[작성 위치 안내](../00-workspace.md) · [구현 안내로 돌아가기](../05-implement.md)


문법이 아니라 순서입니다. TypeScript 로 옮기는 일은 직접 하세요.

```
newConversation():
    system 메시지 하나(내용: buildSystemPrompt() 의 결과)를 담은 새 배열을 돌려준다

ask(history, question):
    sendList  = history 의 모든 메시지, 그 뒤에 { role: user, content: question }   # 새 배열
    reply     = (기다려서) chat(sendList)                                          # assistant 메시지 하나
    newHistory = sendList 의 모든 메시지, 그 뒤에 reply                              # 또 새 배열
    돌려준다: { messages: newHistory, answer: reply 의 글(content) }
```

체크 포인트:
- 배열을 만들 때 `push` 를 쓰면 원본이 바뀝니다. `[...배열, 새것]` 은 새 배열을 만듭니다.
- `answer` 는 `reply` 객체 전체가 아니라 `reply.content` 입니다.

(다음 단계: `npm run hint -- u01 3` → 부분 코드)

---

**보조 경로 · 순서 힌트**

[← 이전 힌트: 개념 힌트](1-concept.md)

[다음 힌트: 부분 코드 힌트 →](3-partial.md)

**[기본 코드 구현 챕터로 돌아가기 →](../05-implement.md)**

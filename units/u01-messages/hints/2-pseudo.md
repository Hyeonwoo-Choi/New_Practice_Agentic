# 힌트 2단계 — 의사코드

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

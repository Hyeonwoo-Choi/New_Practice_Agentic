# U01 정답 해설

먼저 직접 써 본 뒤에 읽으세요. 읽은 뒤에는 닫고 내 코드를 다시 쓰세요.

## newConversation

```ts
return [{ role: "system", content: buildSystemPrompt() }];
```

- **문법:** 배열 리터럴 안에 객체 하나.
- **API 형식:** 메시지는 `{ role, content }`.
- **설계:** 호출할 때마다 *새 배열* 을 만든다. 모듈 위에 `const log = []` 를 두고 돌려주면 대화 사이에 기록이 섞인다 (실험 e2).

## ask

```ts
const withQuestion: Message[] = [...history, { role: "user", content: question }];
const reply = await chat(withQuestion);
return { messages: [...withQuestion, reply], answer: reply.content };
```

| 줄 | 하는 일 | 없으면 |
|---|---|---|
| `[...history, user질문]` | 지금까지의 기록 + 새 질문. 원본은 안 바뀐다 | `history.push(...)` 로 하면 호출한 쪽의 기록이 몰래 바뀐다 (`no-mutation` 실패) |
| `await chat(...)` | 모델 응답을 기다린다 | `reply` 가 Promise 라 `reply.content` 가 `undefined` |
| `[...withQuestion, reply]` | **답을 기록에 붙인다** | 다음 질문 때 "그중" 의 근거가 없다 (실험 e1, `first-call`/`followup-knows` 실패) |
| `answer: reply.content` | 호출한 쪽이 쓰기 쉬운 글 | 메시지 객체를 그대로 주면 `answer.includes` 같은 곳에서 오류 |

## 응용 (apply.ts)

```ts
const conversations = new Map<string, Message[]>();
...
const history = conversations.get(userId) ?? newConversation();
const turn = await ask(history, question);
conversations.set(userId, turn.messages);
```

- 사용자 번호 → 그 사람의 기록. `??` 는 "왼쪽이 없으면(`undefined`) 오른쪽".
- 이 구조가 U06 에서 `thread_id` 와 checkpointer 로 일반화됩니다. `userId` 가 곧 "대화 번호" 입니다.
- 한계: 서비스가 꺼지면 `Map` 이 사라집니다. 저장하는 방법은 U06.

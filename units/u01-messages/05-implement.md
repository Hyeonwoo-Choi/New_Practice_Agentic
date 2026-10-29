# 5. 직접 구현

작업 폴더 만들기 (처음 한 번):

```bash
npm run begin -- u01
```

`units/u01-messages/work/conversation.ts` 를 여세요. `TODO(U01-1)` 과 `TODO(U01-2)` 가 있습니다. **`start/` 폴더는 고치지 마세요** (되돌릴 때 쓰는 원본입니다).

## TODO(U01-1) `newConversation()`

- 하는 일: 새 대화를 시작할 때의 `messages` 를 만든다.
- 맨 앞에 `system` 메시지 **한 개**가 들어 있어야 한다. 내용은 `buildSystemPrompt()` 가 돌려주는 글을 그대로 쓴다.
- 돌려주는 것은 **새 배열**이다. (매번 새로 만들어야 한다. 왜인지는 실험 e2 에서 확인합니다)

## TODO(U01-2) `ask(history, question)`

- 하는 일: `history` 뒤에 `question` 을 user 메시지로 붙여 모델을 부르고, 답까지 붙은 기록과 답의 글을 돌려준다.
- 약속(API): `history` 배열은 **바꾸지 않는다**. 이어 붙인 새 배열을 돌려준다.
- 돌려주는 모양: `{ messages: Message[], answer: string }` — `messages` 의 마지막은 방금 받은 assistant 답이다.

### 쓰기 전에 3분 생각하기

- 모델에 보낼 배열은 무엇인가? (history + 무엇)
- 모델의 답을 받은 뒤, 돌려줄 배열은 무엇인가? (보낸 배열 + 무엇)
- `await` 는 어느 줄에 필요한가?

## 확인

```bash
npm run check -- u01        # 5개 검사
npm run play  -- u01        # 두 번 대화해 보기 (눈으로 확인)
npm run view                # 학습 화면: 실행 단계를 하나씩 보기
```

실패하면 **기대값 · 실제값 · 읽을 개념 · 고칠 곳** 이 나옵니다. 메시지를 읽고 고치세요. 실패는 정상입니다. 처음엔 TODO 때문에 5개가 모두 실패하는 것이 맞습니다.

## 쓰는 중에 주의할 것

- `Turn` 타입의 `answer` 는 assistant 메시지의 `content` (글)입니다. 메시지 객체 전체가 아닙니다.
- 지운 `void chat;` · `void buildSystemPrompt;` 줄은 "아직 안 써서 편집기가 경고하지 않게" 임시로 둔 줄입니다. 그 값을 쓰게 되면 지우세요.
- AI 에게 도움을 받는다면: [AI 사용 가이드](../../docs/ai-guide.md) 의 "직접 구현 구간" 규칙을 먼저 읽으세요.

통과했다면 [06-experiments.md](06-experiments.md) 로.

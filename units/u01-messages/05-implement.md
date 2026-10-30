# 5. 직접 구현

> **지금 하는 일: 코드 작성 · 이 문서는 안내만**
>
> [work/conversation.ts](work/conversation.ts)를 열고 TODO(U01-1), TODO(U01-2) 안에 코드를 씁니다. work가 없으면 터미널에서 npm run begin -- u01을 먼저 실행하세요.

**이렇게 생각해 보세요:** 이 .md에 코드를 써도 검사는 실행하지 않습니다. 검사 대상은 work/conversation.ts입니다. start/는 복사용 원본이고 example/은 읽기 예제입니다.

[작성 위치 안내](00-workspace.md) · [단원 목차](README.md) · [실행 예제](example/ex2-followup.ts)

---


작업 폴더 만들기 (처음 한 번):

```bash
npm run begin -- u01
```

`units/u01-messages/work/conversation.ts` 를 여세요. `TODO(U01-1)` 과 `TODO(U01-2)` 가 있습니다. **`start/` 폴더는 고치지 마세요** (되돌릴 때 쓰는 원본입니다).

## 작성 위치를 먼저 확인하세요

[work/conversation.ts](work/conversation.ts)를 여세요. 함수 이름과 매개변수, Turn 타입은 유지하고 해당 함수의 중괄호 안을 구현합니다.

| 찾을 표시 | 교체할 임시 코드 | 작성할 내용 |
|---|---|---|
| TODO(U01-1) | newConversation 안의 return notImplemented(...) | system 메시지 하나가 든 새 배열 반환 |
| TODO(U01-2) | ask 안의 void chat;와 return notImplemented(...) | 질문 추가 → 호출 → 답 추가 → 결과 반환 |

buildSystemPrompt를 사용했다면 맨 아래 임시 void buildSystemPrompt;도 제거해도 됩니다. 사용하지 않게 된 notImplemented import도 정리할 수 있습니다.

### 입력과 출력을 구체적으로 보기

| 이름 | 뜻 | 후속 질문 때의 예 |
|---|---|---|
| history | 지금까지의 공책 | system, 첫 질문, 첫 답: 3개 |
| question | 이번 질문 | “그중 가장 저렴한 곳은?” |
| 모델에게 보낼 배열 | 기존 기록 + 이번 질문 | 4개 |
| reply | 모델의 이번 답 객체 | assistant 이름표 + 답의 글 |
| 반환할 messages | 이번 답까지 붙은 새 공책 | 5개 |
| 반환할 answer | 화면에 보여 줄 글 | reply.content |

첫 질문이라면 원래 history는 1개, 보낼 배열은 2개, 반환할 배열은 3개입니다. 원래 history는 1개 그대로 남겨야 합니다. 위 표는 프로그램이 처리할 값의 예이고, 학습자가 이 문서에 답을 적는 칸은 아닙니다.

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

---

**챕터 8 / 13 · 기본 코드 구현**

[← 이전 챕터: 실행 전 예상 적기](predictions.md)

**[다음 챕터: 오류 실험 관찰 →](06-experiments.md)**

P4 예상 → e1 실행 → 회고 3 작성 순서로 진행하세요.

# 2. 선수 지식 (짧게)

> **지금 하는 일: 문법 확인 · 작성 없음**
>
> 아래 확인 질문은 머릿속으로 풀어도 됩니다. 연습해 보고 싶다면 [scratch.ts](example/scratch.ts)에만 적으세요.

**이렇게 생각해 보세요:** `const old = ["첫 질문"]; const next = [...old, "첫 답"];`에서 ...old는 기존 내용을 펼쳐 넣습니다. old는 그대로이고 next에만 답이 추가됩니다.

[작성 위치 안내](00-workspace.md) · [단원 목차](README.md) · [실행 예제](example/ex2-followup.ts)

---


이 단원 코드를 읽고 쓰려면 아래 네 가지가 필요합니다. 이미 아는 항목은 건너뛰세요. 낯설면 링크의 보충 단원을 먼저 읽으세요 (각 5분).

| 필요한 것 | 이 단원에서 쓰이는 곳 | 보충 |
|---|---|---|
| 객체 `{ role, content }` 와 배열 `[a, b]` | 메시지 하나, 메시지 목록 | [S1 객체·배열·함수](../../docs/foundations/s1-objects-functions.md) |
| 배열 펼치기 `[...old, new]` | 기존 기록을 건드리지 않고 새 기록 만들기 | S1 |
| `async` 함수와 `await` | 모델 호출은 시간이 걸려서 기다려야 한다 | [S2 async/await](../../docs/foundations/s2-async-await.md) |
| 요청 → 응답, JSON | 모델 호출이 하는 일의 정체 | [S3 HTTP·JSON·API](../../docs/foundations/s3-http-json-api.md) |

## TypeScript 표기 한 가지

```ts
type Message = { role: "system" | "user" | "assistant" | "tool"; content: string };
function ask(history: Message[], question: string): Promise<Turn> { ... }
```

- `: Message[]` 는 "Message 가 들어 있는 배열" 이라는 **타입 표시**입니다. 실행에는 영향이 없고, 실수를 편집기가 미리 알려 줍니다.
- `Promise<Turn>` 은 "나중에 Turn 이 도착할 약속" 입니다. `async` 함수는 늘 Promise 를 돌려줍니다.

## 스스로 확인 (답은 머릿속으로)

1. `const a = [1, 2]; const b = [...a, 3];` 일 때 `a` 는 어떻게 되나?
2. `await` 를 빼먹고 `const r = chat(msgs); console.log(r.content)` 를 하면 무엇이 찍힐까?

1번은 `a` 가 그대로 `[1, 2]`, 2번은 `undefined` (아직 Promise 이기 때문) 입니다. 다르게 생각했다면 S1, S2 를 읽고 오세요.


---

[← 이전](01-problem.md) · [작성 위치 안내](00-workspace.md) · [다음 → 03-concept.md](03-concept.md)

# 진단 문제 — 시작 전에 10분

점수를 매기는 시험이 아닙니다. **어떤 보충 단원을 읽고 시작할지** 정하는 용도입니다. 답은 종이나 노트에 적고, 마지막에 [정답 표](00-diagnostic-answers.md) 를 보세요. 모르면 "모름" 이라고 쓰세요. 찍지 마세요.

## A. 객체·배열·함수 (S1)

**A1.** 아래 코드를 실행하면 `console.log` 가 찍는 것은?

```ts
const msg = { role: "user", content: "안녕" };
const list = [msg, { role: "assistant", content: "네" }];
console.log(list[1].content, list.length);
```

**A2.** `a` 와 `b` 는 각각 어떻게 되나?

```ts
const a = [1, 2];
const b = [...a, 3];
```

**A3.** 아래 함수는 `a` 를 바꾸나, 바꾸지 않나?

```ts
function f(a: number[]) { a.push(9); return a; }
```

## B. async / await (S2)

**B1.** 아래에서 `await` 를 빼면 `r` 에는 무엇이 들어가나?

```ts
async function getNumber() { return 7; }
const r = await getNumber();
```

**B2.** "`async` 함수는 항상 ○○ 를 돌려준다." ○○ 를 채우세요.

**B3.** `await` 는 아무 곳에서나 쓸 수 있나? 어디서 쓸 수 있나?

## C. HTTP·JSON·API (S3)

**C1.** 아래 문자열은 JSON 이다. JavaScript 객체로 바꾸는 함수는?

```
'{"model":"x","messages":[{"role":"user","content":"hi"}]}'
```

**C2.** "요청(request)" 과 "응답(response)" 중 서버가 돌려주는 것은?

**C3.** API 키를 코드 파일에 직접 적으면 안 되는 이유를 한 문장으로.

## D. 터미널과 TypeScript (S1 끝부분)

**D1.** `function ask(h: Message[], q: string): Promise<Turn>` 에서 `: Message[]` 와 `Promise<Turn>` 은 각각 무엇을 말하나?

**D2.** `npm run check -- u01` 에서 `--` 는 무슨 역할인가? (모르면 "모름")

---

## 결과를 보고 할 일

| 틀리거나 모름 | 읽을 것 |
|---|---|
| A 영역 하나라도 | [S1 객체·배열·함수](s1-objects-functions.md) |
| B 영역 하나라도 | [S2 async/await](s2-async-await.md) |
| C 영역 하나라도 | [S3 HTTP·JSON·API](s3-http-json-api.md) |
| D | S1 마지막 절 |
| 전부 맞음 | U01 로 바로 가도 됩니다 |

보충 단원은 각 5~10분입니다. 읽은 뒤 해당 영역 문제를 다시 풀어 보세요. **기초를 건너뛰면 U01 에서 "코드를 따라 쓰기" 로 돌아가기 쉽습니다.**

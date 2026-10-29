# S1. 객체 · 배열 · 함수 · 타입 표시 (보충)

U01~U03 에서 쓰는 만큼만 다룹니다. 5~10분.

## 객체: 이름 붙은 값 묶음

```ts
const msg = { role: "user", content: "안녕" };
msg.role;     // "user"
msg.content;  // "안녕"
```

`{ 이름: 값, ... }` 입니다. `msg.role` 처럼 점으로 꺼냅니다.

## 배열: 순서 있는 목록

```ts
const list = [msg, { role: "assistant", content: "네" }];
list[0];       // 첫 번째 (0부터 센다)
list.length;   // 2
list.at(-1);   // 마지막
```

## 펼치기 `...`: 새 배열 만들기

```ts
const a = [1, 2];
const b = [...a, 3];  // b = [1, 2, 3], a 는 그대로 [1, 2]
```

`push` 와 비교하세요.

```ts
a.push(3);            // a 자체가 [1, 2, 3] 으로 바뀐다 (원본이 바뀜)
```

> 이 프로젝트에서 기록(history)은 **바꾸지 않고 새로 만듭니다.** 그래야 같은 기록으로 다른 시도를 해 볼 수 있습니다.

## 함수: 입력 → 출력

```ts
function add(x: number, y: number): number {
  return x + y;
}
```

`x: number` 처럼 `:` 뒤는 **타입 표시**입니다. 실행에는 영향이 없고, 편집기가 실수를 미리 알려 줍니다.

## 타입 표시 읽는 법

| 표시 | 뜻 |
|---|---|
| `string`, `number` | 글, 숫자 |
| `Message[]` | Message 객체들의 배열 |
| `{ role: string; content: string }` | 이 두 칸을 가진 객체 |
| `"user" \| "assistant"` | 이 두 글자 중 하나 |
| `Promise<Turn>` | 나중에 Turn 이 도착할 약속 ([S2](s2-async-await.md)) |
| `import type { Message } from "..."` | 타입만 가져온다 (실행 코드에는 안 남음) |

## 터미널 한 가지

```bash
npm run check -- u01
```

`npm run 스크립트이름` 에서 `--` 뒤의 값(`u01`)이 스크립트로 전달됩니다.

## 확인 문제

`const list = [1,2,3]; const next = [...list, 4];` 일 때 `list.length` 와 `next.length` 는? (3, 4)

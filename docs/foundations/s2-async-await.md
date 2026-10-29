# S2. async / await (보충)

모델 호출은 **시간이 걸립니다.** (네트워크 요청이 가고 응답이 올 때까지.) 그동안 프로그램 전체가 멈추면 안 되니, JavaScript 는 "나중에 도착할 값" 을 **Promise(약속)** 로 다룹니다.

## 핵심 두 줄

- `async function f() { return 7 }` 의 반환값은 숫자 7 이 아니라 **Promise<number>** 입니다.
- `await` 는 그 Promise 가 끝날 때까지 **그 줄에서 기다렸다가 값을 꺼냅니다.**

```ts
async function getNumber() { return 7; }

const p = getNumber();         // Promise (아직 값이 아님)
const r = await getNumber();   // 7
console.log(p, r);
```

## `await` 를 빼먹으면

```ts
async function ask() {
  const reply = chat(messages);        // await 없음
  console.log(reply.content);          // undefined — reply 는 아직 Promise
}
```

가장 흔한 실수입니다. `reply.content` 에서 오류가 나는 대신 **조용히 `undefined`** 가 되는 경우도 있습니다.

## 어디서 쓸 수 있나

- `async` 함수 안
- 이 프로젝트의 `.ts` 파일 맨 위(최상위): ES 모듈이라 허용됩니다 (예: `example/ex1-single-call.ts`)
- 일반(비 async) 함수 안에서는 쓸 수 없습니다 → 그 함수를 `async` 로 바꾸세요

## 부르는 쪽도 기다려야 한다

```ts
async function ask() { ...; return result; }

const x = ask();         // Promise
const y = await ask();   // 결과
```

`ask` 가 async 면 **부르는 쪽도 await** 해야 결과를 씁니다. 그래서 async 는 위로 퍼집니다.

## 오류

```ts
try {
  const reply = await chat(messages);
} catch (e) {
  console.error("호출 실패:", e);
}
```

`await` 한 곳에서 던져진 오류를 `try/catch` 로 잡을 수 있습니다.

## 확인 문제

1. `const r = getNumber()` 의 `r` 은? (Promise)
2. 일반 함수 안에서 `await` 를 쓰면? (문법 오류)

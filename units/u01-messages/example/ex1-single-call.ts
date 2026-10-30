/**
 * 작동하는 예시 (읽는 용도) — 모델을 한 번 부르는 가장 작은 프로그램.
 * 04-example.md 의 질문에 답하면서 줄마다 무슨 일을 하는지 확인하세요.
 * 돌려 보기:  npx tsx units/u01-messages/example/ex1-single-call.ts
 */
import { chat } from "@lib/llm";
import { buildSystemPrompt } from "@lib/rooms";
import type { Message } from "@lib/types";

// 읽기 예제에서는 항상 키와 네트워크가 필요 없는 연습용 모델을 쓴다.
process.env.LLM_MODE = "fake";

const messages: Message[] = [
  { role: "system", content: buildSystemPrompt() },
  { role: "user", content: "4명이 쓸 방 찾아 줘" },
];

console.log("호출 전 기록:");
messages.forEach((message, index) => console.log(`[${index}] ${message.role}\n${message.content}\n`));
const reply = await chat(messages);
console.log("돌아온 답 (메시지 객체 하나):", reply);
console.log("호출 후 기록:");
messages.forEach((message, index) => console.log(`[${index}] ${message.role}\n${message.content}\n`));
console.log("기록의 메시지 개수:", messages.length);
console.log("답을 기록하고 이어 묻는 과정은 ex2-followup.ts에서 봅니다.");

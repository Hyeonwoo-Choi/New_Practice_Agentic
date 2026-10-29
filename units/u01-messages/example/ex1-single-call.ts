/**
 * 작동하는 예시 (읽는 용도) — 모델을 한 번 부르는 가장 작은 프로그램.
 * 04-example.md 의 질문에 답하면서 줄마다 무슨 일을 하는지 확인하세요.
 * 돌려 보기:  npx tsx units/u01-messages/example/ex1-single-call.ts
 */
import { chat } from "@lib/llm";
import { buildSystemPrompt } from "@lib/rooms";
import type { Message } from "@lib/types";

const messages: Message[] = [
  { role: "system", content: buildSystemPrompt() },
  { role: "user", content: "4명이 쓸 방 찾아 줘" },
];

const reply = await chat(messages);
console.log(reply.role); // 어떤 role 이 찍힐까?
console.log(reply.content);
console.log(messages.length); // 몇 개가 찍힐까? chat 이 messages 를 바꿨을까?

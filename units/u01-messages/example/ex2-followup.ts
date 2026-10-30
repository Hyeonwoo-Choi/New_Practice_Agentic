/** 읽기 예제: 실행 전에 04-example.md의 질문을 예상해 보세요. */
import { chat } from "@lib/llm";
import { buildSystemPrompt } from "@lib/rooms";
import type { Message } from "@lib/types";

process.env.LLM_MODE = "fake"; // 키와 네트워크 없이 연습한다.

// 1. 개발자의 업무 지침과 사용자의 첫 질문을 넣는다.
const messages: Message[] = [
  { role: "system", content: buildSystemPrompt() },
  { role: "user", content: "4명이 쓸 방 찾아 줘" },
];
console.log("1. 첫 질문을 보냅니다:");
messages.forEach((message, index) => console.log(`[${index}] ${message.role}\n${message.content}\n`));

// 2. 모델이 답 하나를 돌려준다. 배열에 자동 저장되지는 않는다.
const firstReply = await chat(messages);
console.log("2. 첫 답을 받았습니다:\n" + firstReply.content);
console.log("아직 기록은", messages.length, "개입니다.");

// 3. 우리 프로그램이 답을 저장한다. 저장소는 messages 배열이다.
messages.push(firstReply);
console.log("3. 답을 추가한 기록:");
messages.forEach((message, index) => console.log(`[${index}] ${message.role}\n${message.content}\n`));

// 4. 다음 질문을 붙이고, 이전 답을 포함한 전체 기록을 보낸다.
messages.push({ role: "user", content: "그중 가장 저렴한 곳은?" });
console.log("4. 후속 질문에 보내는 기록:");
messages.forEach((message, index) => console.log(`[${index}] ${message.role}\n${message.content}\n`));
const secondReply = await chat(messages);
console.log("두 번째 답:\n" + secondReply.content);
messages.push(secondReply);
console.log("두 번째 답까지 저장한 기록은", messages.length, "개입니다.");

// 5. 비교: 앞 대화가 없는 새 기록에는 '그중'의 근거가 없다.
const freshMessages: Message[] = [
  { role: "system", content: buildSystemPrompt() },
  { role: "user", content: "그중 가장 저렴한 곳은?" },
];
console.log("5. 이전 기록 없이 후속 질문만 보내면:");
const freshReply = await chat(freshMessages);
console.log(freshReply.content);

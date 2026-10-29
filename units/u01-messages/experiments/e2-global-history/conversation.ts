/**
 * 실험 e2 — "AI 가 써 줬다" 고 가정한 코드. 대화 하나만 할 때는 잘 돌아갑니다.
 * 읽고 어디가 이상한지 먼저 찾아본 뒤에 돌려 보세요:  npm run experiment -- u01 e2
 */
import { chat } from "@lib/llm";
import { buildSystemPrompt } from "@lib/rooms";
import type { Message } from "@lib/types";

const log: Message[] = [];

export function newConversation(): Message[] {
  if (log.length === 0) log.push({ role: "system", content: buildSystemPrompt() });
  return log;
}

export async function ask(_history: Message[], question: string) {
  log.push({ role: "user", content: question });
  const reply = await chat(log);
  log.push(reply);
  return { messages: log, answer: reply.content };
}

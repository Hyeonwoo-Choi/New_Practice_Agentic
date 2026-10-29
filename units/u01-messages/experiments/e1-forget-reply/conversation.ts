/**
 * 실험 e1 — "AI 가 써 줬다" 고 가정한 코드. 깔끔해 보이고 한 번 실행하면 답도 나옵니다.
 * 읽고 어디가 이상한지 먼저 찾아본 뒤에 돌려 보세요:  npm run experiment -- u01 e1
 * (이 파일은 연습용입니다. 내 work/ 와 별개이며 고치지 않아도 됩니다)
 */
import { chat } from "@lib/llm";
import { buildSystemPrompt } from "@lib/rooms";
import type { Message } from "@lib/types";

export function newConversation(): Message[] {
  return [{ role: "system", content: buildSystemPrompt() }];
}

export async function ask(history: Message[], question: string) {
  const messages: Message[] = [...history, { role: "user", content: question }];
  const reply = await chat(messages);
  return { messages, answer: reply.content };
}

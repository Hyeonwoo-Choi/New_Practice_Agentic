/** U01 정답 · conversation.ts — 먼저 직접 써 본 뒤에 읽으세요. 해설은 EXPLANATION.md */
import { chat } from "@lib/llm";
import { buildSystemPrompt } from "@lib/rooms";
import type { Message } from "@lib/types";

export type Turn = { messages: Message[]; answer: string };

export function newConversation(): Message[] {
  return [{ role: "system", content: buildSystemPrompt() }];
}

export async function ask(history: Message[], question: string): Promise<Turn> {
  const withQuestion: Message[] = [...history, { role: "user", content: question }]; // 새 배열: history 는 그대로
  const reply = await chat(withQuestion);
  return { messages: [...withQuestion, reply], answer: reply.content };
}

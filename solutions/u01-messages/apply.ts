/** U01 정답 · apply.ts */
import { ask, newConversation } from "./conversation.js";
import type { Message } from "@lib/types";

export function createChatService() {
  const conversations = new Map<string, Message[]>(); // 사용자 번호 → 그 사람의 대화 기록
  return {
    async say(userId: string, question: string): Promise<string> {
      const history = conversations.get(userId) ?? newConversation();
      const turn = await ask(history, question);
      conversations.set(userId, turn.messages);
      return turn.answer;
    },
  };
}

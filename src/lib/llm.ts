/** 네트워크 없이 연습용 모델을 호출하고 실제 입출력을 기록한다. */
import { fakeChat } from "./fake-llm.js";
import { emit } from "./trace.js";
import { redact } from "./redact.js";
import type { Message } from "./types.js";

export async function chat(messages: Message[]): Promise<Message> {
  const sent = messages.map(message => ({ role: message.role, content: message.content }));
  try {
    const reply = fakeChat(messages);
    emit("llm_call", "llm", { mode: "fake", sent, reply: { role: reply.role, content: reply.content } }, "llm");
    return reply;
  } catch (error) {
    emit("llm_call", "llm", { mode: "fake", sent, error: redact((error as Error).message) }, "llm");
    throw error;
  }
}

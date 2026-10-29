/**
 * 모델을 부르는 곳. 학습자 코드는 chat(messages) 한 줄로 부른다.
 * 부를 때마다 실행 기록(trace)에 "무엇을 보냈고 무엇이 왔는지" 가 남는다.
 *
 * 기본은 fake(LLM_MODE=fake). 실제 모델은 LLM_MODE=real + .env 의 키가 있을 때만 쓴다.
 */
import { fakeChat } from "./fake-llm.js";
import { emit } from "./trace.js";
import { redact } from "./redact.js";
import type { Message } from "./types.js";

async function realChat(messages: Message[]): Promise<Message> {
  const { LLM_BASE_URL, LLM_API_KEY, LLM_MODEL } = process.env;
  if (!LLM_BASE_URL || !LLM_API_KEY || !LLM_MODEL) {
    throw new Error("LLM_MODE=real 이면 .env 에 LLM_BASE_URL · LLM_API_KEY · LLM_MODEL 이 필요합니다 (.env.example 참고)");
  }
  const res = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${LLM_API_KEY}` },
    body: JSON.stringify({ model: LLM_MODEL, messages, temperature: 0.2 }),
  });
  if (!res.ok) throw new Error(`LLM 호출 실패 ${res.status}: ${redact((await res.text()).slice(0, 300))}`);
  const data = (await res.json()) as { choices: { message: { content: string | null } }[] };
  return { role: "assistant", content: data.choices[0].message.content ?? "" };
}

export async function chat(messages: Message[]): Promise<Message> {
  const mode = process.env.LLM_MODE === "real" ? "real" : "fake";
  const sent = messages.map((m) => ({ role: m.role, content: m.content })); // 보낸 순간의 모습을 복사해 둔다
  try {
    const reply = mode === "real" ? await realChat(messages) : fakeChat(messages);
    emit("llm_call", "llm", { mode, sent, reply: { role: reply.role, content: reply.content } }, "llm");
    return reply;
  } catch (e) {
    emit("llm_call", "llm", { mode, sent, error: redact(String((e as Error).message)) }, "llm");
    throw e;
  }
}

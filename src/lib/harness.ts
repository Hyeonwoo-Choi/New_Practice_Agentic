/** 검사를 돌리는 쪽에서 쓰는 도우미. 학습자 코드를 대신 실행해 주지는 않는다 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { currentRun, emit } from "./trace.js";
import type { Impl } from "./unit.js";
import type { Message, TraceEvent } from "./types.js";

export function makeImpl(dir: string, label: Impl["label"]): Impl {
  return {
    dir,
    label,
    async load<T>(name: string) {
      const file = ["ts", "js"].map((ext) => path.join(dir, `${name}.${ext}`)).find((f) => fs.existsSync(f));
      if (!file) throw new Error(`${dir} 에 ${name}.ts 파일이 없습니다. npm run begin 으로 만들었는지 확인하세요`);
      return (await import(pathToFileURL(file).href)) as T;
    },
  };
}

/** 지금 실행의 llm_call 기록만 꺼낸다 */
export function llmCalls(): TraceEvent[] {
  return (currentRun()?.events ?? []).filter((e) => e.type === "llm_call");
}

export const sentOf = (e: TraceEvent) => ((e.data.sent as Message[]) ?? []);
export const roles = (ms: Message[]) => ms.map((m) => m.role).join(" → ") || "(없음)";
export const clip = (s: string, n = 60) => (s.length > n ? s.slice(0, n) + "…" : s).replace(/\n/g, "⏎");

/**
 * 한 번의 질문-답을 기록한다: 질문 → (모델 호출은 chat() 이 기록) → 답.
 * 하네스가 보는 것은 "넣은 질문" 과 "돌려받은 답·기록" 뿐이다.
 */
export async function turn<T extends { answer: string; messages?: Message[] }>(
  question: string,
  fn: () => Promise<T>,
  opts: { before?: Message[]; who?: string } = {},
): Promise<T> {
  emit("turn_start", "flow", { question, who: opts.who, stateBefore: opts.before?.map(slim) }, "question");
  try {
    const out = await fn();
    emit("turn_end", "flow", { answer: out.answer, who: opts.who, stateAfter: out.messages?.map(slim) }, "answer");
    return out;
  } catch (e) {
    emit("error", "flow", { message: String((e as Error).message), name: (e as Error).name }, "answer");
    throw e;
  }
}

const slim = (m: Message) => ({ role: m.role, content: m.content });

/** 파일 안에서 TODO(id) 가 있는 줄 번호를 찾는다. 없으면 파일 맨 앞 */
export function locateTodo(file: string, id: string): string {
  if (!fs.existsSync(file)) return `${file} (파일 없음 - npm run begin 먼저)`;
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const at = lines.findIndex((l) => l.includes(`TODO(${id})`));
  return `${file}:${at >= 0 ? at + 1 : 1}`;
}

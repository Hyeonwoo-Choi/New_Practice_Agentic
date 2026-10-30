/** 현재 검사 실행의 모델 호출 기록을 읽는 도우미. */
import { currentRun } from "./trace.js";
import type { Message, TraceEvent } from "./types.js";

export const llmCalls = (): TraceEvent[] => (currentRun()?.events ?? []).filter(event => event.type === "llm_call");
export const sentOf = (event: TraceEvent): Message[] => (event.data.sent as Message[]) ?? [];
export const roles = (messages: Message[]): string => messages.map(message => message.role).join(" → ") || "(없음)";

/** 모델에 보내고 받는 메시지. */
export type Role = "system" | "user" | "assistant" | "tool";
export type Message = { role: Role; content: string };
export type Layer = "flow" | "llm";

export type TraceEvent = {
  seq: number;
  runId: string;
  ts: string;
  type: string;
  layer: Layer;
  node?: string;
  data: Record<string, unknown>;
};

export type RunRecord = {
  runId: string;
  unit: string;
  scenario: string;
  kind: "check" | "play";
  mode: "fake";
  impl: string;
  startedAt: string;
  endedAt?: string;
  events: TraceEvent[];
};

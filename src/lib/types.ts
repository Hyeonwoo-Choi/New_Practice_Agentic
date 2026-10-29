/** 모델에 보내고 받는 메시지 한 개. role 이 누가 한 말인지 알려 준다 */
export type Role = "system" | "user" | "assistant" | "tool";
export type Message = { role: Role; content: string };

/** 화면에서 정보를 단계적으로 보여 주기 위한 층. 단원이 배운 층만 보인다 */
export type Layer = "flow" | "llm" | "tool" | "state" | "store" | "approval";

export type TraceEvent = {
  seq: number;
  runId: string;
  ts: string;
  type: string;
  layer: Layer;
  node?: string;
  data: Record<string, unknown>;
};

export type CheckResult = {
  id: string;
  title: string;
  pass: boolean;
  expected: string;
  actual: string;
  concept: string;
  where: string;
  runId: string;
  error?: string;
};

export type RunRecord = {
  runId: string;
  unit: string;
  scenario: string;
  kind: "check" | "play" | "experiment";
  mode: "fake" | "real";
  impl: string;
  startedAt: string;
  endedAt?: string;
  events: TraceEvent[];
  result?: CheckResult;
};

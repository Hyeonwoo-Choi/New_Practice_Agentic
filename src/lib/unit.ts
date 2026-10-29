/** 단원 정의의 모양. 모든 단원의 unit.ts 가 이 모양을 따른다 */
import type { Layer, RunRecord } from "./types.js";

/** 학습자가 만든(또는 정답/실험) 코드가 들어 있는 폴더를 가리킨다 */
export type Impl = {
  dir: string;
  label: "work" | "solution" | "start" | "experiment";
  load<T>(name: string): Promise<T>;
};

export type CheckOutcome = { pass: boolean; expected: string; actual: string };

export type CheckCase = {
  id: string;
  group: "main" | "apply";
  title: string;
  /** 틀렸을 때 읽을 개념 문서 (프로젝트 루트 기준 경로 + 절 제목) */
  concept: string;
  /** 고칠 곳: 파일(impl 폴더 기준)과 코드 안의 TODO 표시 */
  todo: { file: string; id: string };
  run(impl: Impl): Promise<CheckOutcome>;
};

export type PredictionCtx = {
  /** 검사 id → 그 검사의 실행 기록 (가장 최근 check) */
  checkRuns: Record<string, RunRecord | undefined>;
  /** 실험 id → 실패한 검사 id 들 */
  experiments: Record<string, { failed: string[] } | undefined>;
};

export type PredictionDef = {
  id: string; // P1, P2 ...
  prompt: string;
  /** choice 면 A/B 로 답한다. 없으면 숫자나 짧은 말 */
  options?: string[];
  /** 이 예측을 확인할 수 있는 검사 id 와, 그 실행에서 몇 번째 모델 호출인지(-1 이면 마지막). 화면의 "예측과 달랐던 곳" 표시에 쓴다 */
  runOf?: string;
  llmIndex?: number;
  actual(ctx: PredictionCtx): string | undefined;
};

export type StructureNode = { id: string; label: string; layer: Layer };
export type StructureEdge = { from: string; to: string; label?: string };

export type UnitDef = {
  id: string;
  title: string;
  minutes: number;
  /** 이 단원에서 새로 배우는 핵심 개념 (하나) */
  concept: string;
  /** 화면에 보여 줄 층. 배운 층까지만 보인다 */
  layers: Layer[];
  structure: { nodes: StructureNode[]; edges: StructureEdge[] };
  predictions: PredictionDef[];
  checks: CheckCase[];
  experiments: { id: string; title: string; file: string }[];
  /** npm run play 에서 보여 줄 짧은 시연 (학습자 코드로 실행) */
  play(impl: Impl): Promise<void>;
};

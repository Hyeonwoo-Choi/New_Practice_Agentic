/**
 * 실행 기록(trace). 테스트와 학습 화면이 같은 기록을 쓴다.
 * 학습자 코드가 chat() 을 부를 때, 하네스가 turn 을 시작·끝낼 때 "실제로 일어난 일" 만 적는다.
 * 화면용으로 만들어 낸 경로는 없다.
 */
import fs from "node:fs";
import path from "node:path";
import { RUNS_DIR } from "./paths.js";
import { redactDeep } from "./redact.js";
import type { CheckResult, Layer, RunRecord, TraceEvent } from "./types.js";

let active: RunRecord | null = null;
let counter = 0;

export function startRun(meta: { unit: string; scenario: string; kind: RunRecord["kind"]; impl: string }): RunRecord {
  const runId = `${meta.unit}.${meta.scenario}.${Date.now().toString(36)}${(counter++).toString(36)}`;
  active = {
    runId,
    ...meta,
    mode: process.env.LLM_MODE === "real" ? "real" : "fake",
    startedAt: new Date().toISOString(),
    events: [],
  };
  emit("run_start", "flow", { scenario: meta.scenario, impl: meta.impl });
  return active;
}

export function currentRun(): RunRecord | null {
  return active;
}

export function emit(type: string, layer: Layer, data: Record<string, unknown> = {}, node?: string): void {
  if (!active) return;
  const event: TraceEvent = {
    seq: active.events.length,
    runId: active.runId,
    ts: new Date().toISOString(),
    type,
    layer,
    node,
    data: redactDeep(data),
  };
  active.events.push(event);
}

export function endRun(result?: CheckResult): RunRecord {
  if (!active) throw new Error("endRun: 진행 중인 실행이 없습니다");
  emit("run_end", "flow", {});
  active.endedAt = new Date().toISOString();
  if (result) active.result = result;
  const done = active;
  active = null;
  fs.mkdirSync(RUNS_DIR, { recursive: true });
  fs.writeFileSync(path.join(RUNS_DIR, `${done.runId}.json`), JSON.stringify(done, null, 2));
  return done;
}

export function readRun(runId: string): RunRecord | null {
  const file = path.join(RUNS_DIR, `${path.basename(runId)}.json`);
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as RunRecord) : null;
}

export function listRuns(): RunRecord[] {
  if (!fs.existsSync(RUNS_DIR)) return [];
  return fs
    .readdirSync(RUNS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(RUNS_DIR, f), "utf8")) as RunRecord)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

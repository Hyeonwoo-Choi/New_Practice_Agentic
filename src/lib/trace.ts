/** 터미널 실습에서 실제 호출한 입력·출력을 JSON으로 기록한다. */
import fs from "node:fs";
import path from "node:path";
import { RUNS_DIR } from "./paths.js";
import { redactDeep } from "./redact.js";
import type { Layer, RunRecord, TraceEvent } from "./types.js";

let active: RunRecord | null = null;
let counter = 0;

export function startRun(meta: { unit: string; scenario: string; kind: RunRecord["kind"]; impl: string }): RunRecord {
  const runId = `${meta.unit}.${meta.scenario}.${Date.now().toString(36)}${(counter++).toString(36)}`;
  active = {
    runId,
    ...meta,
    mode: "fake",
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

export function endRun(): RunRecord {
  if (!active) throw new Error("endRun: 진행 중인 실행이 없습니다");
  emit("run_end", "flow", {});
  active.endedAt = new Date().toISOString();
  const done = active;
  active = null;
  fs.mkdirSync(RUNS_DIR, { recursive: true });
  fs.writeFileSync(path.join(RUNS_DIR, `${done.runId}.json`), JSON.stringify(done, null, 2));
  return done;
}

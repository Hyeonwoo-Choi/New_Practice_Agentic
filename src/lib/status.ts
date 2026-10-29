/**
 * 단원 진도 상태 계산. 터미널(npm run status)과 학습 화면이 같은 함수를 쓴다.
 * 네 가지를 따로 보여 준다: 자동 테스트 · 예측과 회고 · 응용 · 사용한 힌트.
 * 이 중 어느 것도 "완전히 이해했다" 를 뜻하지 않는다.
 */
import fs from "node:fs";
import path from "node:path";
import { unitDir } from "./paths.js";
import { readProgress } from "./progress.js";
import { readRun } from "./trace.js";
import type { PredictionCtx, UnitDef } from "./unit.js";

export const PLACEHOLDER = "(여기에 적기)";

export type PredictionRow = { id: string; prompt: string; options?: string[]; guess: string; reason: string; actual?: string; match?: boolean };
export type UnitStatus = {
  unit: string;
  title: string;
  minutes: number;
  autoTest: { state: "none" | "partial" | "pass"; passed: number; total: number; failed: string[]; at?: string };
  predictions: { answered: number; total: number; rows: PredictionRow[]; writtenBeforeFirstRun: boolean | null; firstMismatch?: string };
  reflection: { state: "none" | "partial" | "done"; left: number };
  apply: { state: "none" | "partial" | "pass"; passed: number; total: number };
  hints: { max: number; count: number };
  solutionViews: number;
};

const fileOf = (unit: string, name: string) => path.join(unitDir(unit), name);

export function parsePredictions(text: string): Record<string, { guess: string; reason: string }> {
  const out: Record<string, { guess: string; reason: string }> = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*(P\d+)\s*[:：]\s*(.*)$/);
    if (!m) continue;
    const [guess, ...rest] = m[2].split("|");
    out[m[1]] = { guess: guess.trim(), reason: rest.join("|").replace(/^\s*이유\s*[:：]?/, "").trim() };
  }
  return out;
}

const norm = (s?: string) => (s ?? "").trim().toUpperCase().replace(/\s+/g, "");

export function computeStatus(unit: UnitDef): UnitStatus {
  const prog = readProgress().units[unit.id] ?? {};
  const last = prog.lastCheck;
  const mainTotal = unit.checks.filter((c) => c.group === "main").length;
  const applyTotal = unit.checks.filter((c) => c.group === "apply").length;
  const main = last?.groups.main ?? { passed: 0, total: mainTotal };
  const apply = last?.groups.apply ?? { passed: 0, total: applyTotal };

  // 예측: 학습자 파일 + 실제 실행 기록으로 만든 실제값을 비교한다
  const predFile = fileOf(unit.id, "predictions.md");
  const predText = fs.existsSync(predFile) ? fs.readFileSync(predFile, "utf8") : "";
  const guesses = parsePredictions(predText);
  const ctx: PredictionCtx = { checkRuns: {}, experiments: {} };
  for (const [cid, runId] of Object.entries(last?.runIds ?? {})) ctx.checkRuns[cid] = readRun(runId) ?? undefined;
  for (const [eid, e] of Object.entries(prog.experiments ?? {})) ctx.experiments[eid] = { failed: e.failed };
  const rows: PredictionRow[] = unit.predictions.map((p) => {
    const g = guesses[p.id] ?? { guess: "", reason: "" };
    const actual = p.actual(ctx);
    const answered = g.guess !== "";
    return { id: p.id, prompt: p.prompt, options: p.options, guess: g.guess, reason: g.reason, actual, match: answered && actual !== undefined ? norm(g.guess) === norm(actual) : undefined };
  });
  const answered = rows.filter((r) => r.guess !== "").length;
  const mismatch = rows.find((r) => r.match === false);
  const writtenBefore =
    prog.firstCheckAt && fs.existsSync(predFile) ? fs.statSync(predFile).mtime.toISOString() <= prog.firstCheckAt : null;

  // 회고: 자리표시 문구가 남아 있는 칸 수
  const refFile = fileOf(unit.id, "reflection.md");
  const refText = fs.existsSync(refFile) ? fs.readFileSync(refFile, "utf8") : "";
  // 제목에 "(선택" 이 있는 칸은 필수가 아니라서 세지 않는다
  const sections = refText.split(/^##\s/m).slice(1).filter((sec) => !sec.split("\n")[0].includes("(선택"));
  const left = refText ? sections.filter((sec) => sec.includes(PLACEHOLDER)).length : 1;
  const total = refText ? sections.length : 1;

  const state3 = (p: number, t: number): "none" | "partial" | "pass" => (!t || p === 0 ? "none" : p >= t ? "pass" : "partial");
  return {
    unit: unit.id,
    title: unit.title,
    minutes: unit.minutes,
    autoTest: { state: last ? state3(main.passed, main.total) : "none", passed: main.passed, total: main.total, failed: last?.failed ?? [], at: last?.at },
    predictions: { answered, total: rows.length, rows, writtenBeforeFirstRun: writtenBefore, firstMismatch: mismatch?.id },
    reflection: { state: left === 0 ? "done" : left < total ? "partial" : "none", left },
    apply: { state: state3(apply.passed, apply.total), passed: apply.passed, total: apply.total },
    hints: { max: Math.max(0, ...(prog.hints ?? []).map((h) => h.level)), count: (prog.hints ?? []).length },
    solutionViews: (prog.solutionViews ?? []).length,
  };
}

/**
 * 진도 기록 (progress/progress.json). 학습자 소유라서 도구가 지우거나 덮어쓰지 않는다.
 * 여기에는 "자동 테스트 결과 · 사용한 힌트 · 본 정답" 같은 도구가 관측한 사실만 둔다.
 * 예측·회고·응용 여부는 학습자 파일(predictions.md 등)에서 읽는다.
 */
import fs from "node:fs";
import path from "node:path";
import { PROGRESS_FILE } from "./paths.js";

export type GroupResult = { passed: number; total: number };
export type UnitProgress = {
  firstCheckAt?: string;
  lastCheck?: { at: string; groups: Partial<Record<"main" | "apply", GroupResult>>; failed: string[]; runIds: Record<string, string> };
  experiments?: Record<string, { at: string; failed: string[]; runIds: Record<string, string> }>;
  hints?: { level: number; at: string }[];
  solutionViews?: string[];
};
export type Progress = { units: Record<string, UnitProgress> };

export function readProgress(): Progress {
  try {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8")) as Progress;
  } catch {
    return { units: {} };
  }
}

export function updateUnit(unit: string, fn: (p: UnitProgress) => void): void {
  const all = readProgress();
  const cur = (all.units[unit] ??= {});
  fn(cur);
  fs.mkdirSync(path.dirname(PROGRESS_FILE), { recursive: true });
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(all, null, 2));
}

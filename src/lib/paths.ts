import path from "node:path";
import { fileURLToPath } from "node:url";

/** 프로젝트 루트. 이 파일은 src/lib 에 있으니 두 단계 위 */
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const RUNS_DIR = process.env.RUNS_DIR ?? path.join(ROOT, "runs");
export const PROGRESS_FILE = process.env.PROGRESS_FILE ?? path.join(ROOT, "progress", "progress.json");
export const unitDir = (unit: string) => path.join(ROOT, "units", unit);
export const solutionDir = (unit: string) => path.join(ROOT, "solutions", unit);
/** 상대 경로(슬래시)로 보여 주기 위해 */
export const rel = (p: string) => path.relative(ROOT, p).split(path.sep).join("/");

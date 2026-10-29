/** 단원 찾기: 폴더 이름(u01-messages)이나 앞 글자(u01)로 찾는다 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT, unitDir } from "./paths.js";
import type { UnitDef } from "./unit.js";

export function unitIds(): string[] {
  const dir = path.join(ROOT, "units");
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^u\d+/.test(d.name) && fs.existsSync(path.join(dir, d.name, "unit.ts")))
    .map((d) => d.name)
    .sort();
}

export function resolveUnitId(arg: string | undefined): string {
  const ids = unitIds();
  const hit = arg && ids.find((id) => id === arg || id.startsWith(arg + "-") || id.startsWith(arg));
  if (!hit) {
    console.error(`단원을 찾지 못했습니다: ${arg ?? "(없음)"}\n지금 있는 단원: ${ids.join(", ") || "(없음)"}\n예: npm run check -- u01`);
    process.exit(1);
  }
  return hit;
}

export async function loadUnit(id: string): Promise<UnitDef> {
  const mod = await import(pathToFileURL(path.join(unitDir(id), "unit.ts")).href);
  return mod.default as UnitDef;
}

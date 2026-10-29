/** 검사 실행기: 검사 하나마다 실행 기록 하나를 만든다. check · experiment · selftest 가 같이 쓴다 */
import path from "node:path";
import { locateTodo } from "./harness.js";
import { rel } from "./paths.js";
import { endRun, emit, startRun } from "./trace.js";
import type { CheckCase, Impl, UnitDef } from "./unit.js";
import type { CheckResult, RunRecord } from "./types.js";

export type RunAll = { results: CheckResult[]; runs: RunRecord[] };

export async function runChecks(
  unit: UnitDef,
  impl: Impl,
  kind: "check" | "experiment",
  opts: { groups?: CheckCase["group"][]; tag?: string } = {},
): Promise<RunAll> {
  const results: CheckResult[] = [];
  const runs: RunRecord[] = [];
  const cases = unit.checks.filter((c) => !opts.groups || opts.groups.includes(c.group));
  for (const c of cases) {
    const scenario = opts.tag ? `${opts.tag}.${c.id}` : c.id;
    const run = startRun({ unit: unit.id, scenario, kind, impl: `${impl.label}:${rel(impl.dir)}` });
    const where = locateTodo(path.join(impl.dir, c.todo.file), c.todo.id).replace(/\\/g, "/");
    let result: CheckResult;
    try {
      const out = await c.run(impl);
      result = { id: c.id, title: c.title, pass: out.pass, expected: out.expected, actual: out.actual, concept: c.concept, where: rel2(where), runId: run.runId };
    } catch (e) {
      const err = e as Error;
      const lastEvent = run.events.at(-1);
      // turn() 이 이미 같은 오류를 적었으면 중복해서 적지 않는다
      if (!(lastEvent?.type === "error" && lastEvent.data.message === err.message)) emit("error", "flow", { name: err.name, message: err.message });
      result = {
        id: c.id,
        title: c.title,
        pass: false,
        expected: "오류 없이 끝까지 실행된다",
        actual: `${err.name}: ${err.message}`,
        concept: c.concept,
        where: rel2(where),
        runId: run.runId,
        error: err.name,
      };
    }
    runs.push(endRun(result));
    results.push(result);
  }
  return { results, runs };
}

/** 절대 경로가 들어 있으면 프로젝트 기준 상대 경로로 */
function rel2(p: string): string {
  const m = p.match(/^(.*):(\d+)$/);
  return m ? `${rel(m[1])}:${m[2]}` : rel(p);
}

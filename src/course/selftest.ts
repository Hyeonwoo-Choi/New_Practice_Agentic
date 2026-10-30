/** 임시 폴더에서 검사 정확성과 실제 터미널 입력 흐름을 검증한다. 학습자 파일은 사용하지 않는다. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { ROOT } from "../lib/paths.js";
import { steps, sourceFor } from "./steps.js";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "terminal-course-test-"));
const work = path.join(tmp, "practice");
fs.mkdirSync(work);
fs.writeFileSync(path.join(tmp, "package.json"), JSON.stringify({ type: "module" }));
const env = { ...process.env, COURSE_WORK_DIR: work, COURSE_PROGRESS_FILE: path.join(tmp, "course.json"), RUNS_DIR: path.join(tmp, "runs"), LLM_MODE: "fake" };
const bodies = [
  'return { role: "user", content: text };',
  'return [...history, { role: "user", content: text }];',
  'const reply = await fetchReply(); return reply.content;',
  'return await chat([{ role: "system", content: buildSystemPrompt() }, { role: "user", content: question }]);',
  'return [{ role: "system", content: buildSystemPrompt() }];',
  'const sent: Message[] = [...history, { role: "user", content: question }]; const reply = await chat(sent); return { messages: [...sent, reply], answer: reply.content };',
  'const sent: Message[] = [...history, { role: "user", content: question }]; const reply = await chat(sent); return { messages: [...sent, reply], answer: reply.content };',
  'const users = new Map<string, Message[]>(); return { async say(userId, question) { const t = await ask(users.get(userId) ?? newConversation(), question); users.set(userId, t.messages); return t.answer; } };',
];
const source = (i: number, body: string) => sourceFor(steps[i]).replace(/\/\/ EDIT-BEGIN[\s\S]*?\/\/ EDIT-END/, `// EDIT-BEGIN\n${body}\n// EDIT-END`);
const write = (i: number, body: string) => fs.writeFileSync(path.join(work, steps[i].id + ".ts"), source(i, body));
function verify(index: number, pass: boolean, extra: string[] = []) {
  const r = spawnSync(process.execPath, ["--import", "tsx", "src/course/verify.ts", String(index), ...extra], { cwd: ROOT, env, encoding: "utf8", timeout: 20000 });
  assert(!r.error, String(r.error));
  assert.equal(r.status === 0, pass, r.stdout + r.stderr);
  return r.stdout + r.stderr;
}

function session() {
  const child = spawn(process.execPath, ["--import", "tsx", "src/cli/learn.ts"], { cwd: ROOT, env, stdio: ["pipe", "pipe", "pipe"] });
  let output = "";
  let exited = false;
  child.stdout.on("data", d => { output += d; });
  child.stderr.on("data", d => { output += d; });
  child.on("exit", () => { exited = true; });
  const wait = async (text: string, from = 0) => {
    const until = Date.now() + 25000;
    while (!output.slice(from).includes(text)) {
      if (exited || Date.now() > until) { child.kill(); throw new Error(`출력 대기 실패: ${text}\n${output}`); }
      await new Promise(r => setTimeout(r, 20));
    }
  };
  return {
    child, wait,
    async send(lines: string, expected: string) { const from = output.length; child.stdin.write(lines + "\n"); await wait(expected, from); },
    async quit() {
      const exit = new Promise<number | null>(resolve => child.once("exit", resolve));
      await this.send(":quit", "종료했습니다.");
      assert.equal(await exit, 0);
    },
  };
}

try {
  for (const [i, s] of steps.entries()) fs.writeFileSync(path.join(work, s.id + ".ts"), sourceFor(s));
  verify(0, false);
  console.log("✔ 미완성 코드는 통과하지 않음");
  bodies.forEach((b, i) => write(i, b));
  const demo = verify(7, true, ["--demo"]);
  assert(demo.includes("R-102") && demo.includes("R-201") && demo.includes("bob:"));
  console.log("✔ 전체 8단계 및 다른 사용자·인원 조건의 최종 실행 통과");

  fs.writeFileSync(path.join(work, steps[6].id + ".ts"), sourceFor(steps[6]));
  assert(verify(6, false).includes("assistant 메시지"));
  write(6, bodies[6]);
  write(0, 'return { role: "user", content: "안녕" };');
  verify(0, false);
  write(0, bodies[0]);
  write(1, 'history.push({ role: "user", content: text }); return history;');
  verify(1, false);
  write(1, bodies[1]);
  write(7, 'return { async say(userId, question) { const t = await ask(newConversation(), question); return t.answer; } };');
  verify(7, false);
  write(7, bodies[7]);
  console.log("✔ 고정 답·원본 변경·답 누락·사용자 기록 누락을 검사에서 검출");

  // 실제 입력 흐름: 실패 → 수정 → 같은 프로세스에서 재검사 → 이동 → 재시작.
  fs.writeFileSync(path.join(work, steps[0].id + ".ts"), sourceFor(steps[0]));
  const a = session();
  await a.wait("1/8 ·");
  await a.send(":next", "아직 이동하지 않았습니다.");
  const original = fs.readFileSync(path.join(work, steps[0].id + ".ts"), "utf8");
  await a.send(":edit\nreturn 7;\n:cancel", "입력 취소");
  assert.equal(fs.readFileSync(path.join(work, steps[0].id + ".ts"), "utf8"), original);
  await a.send(":edit\nreturn {\n:save", "저장했습니다.");
  await a.send(":check", "TransformError");
  await a.send(":edit\n" + bodies[0] + "\n:save", "저장했습니다.");
  await a.send(":check", "통과. :next");
  await a.send(":next", "2/8 ·");
  await a.quit();
  assert.equal(JSON.parse(fs.readFileSync(env.COURSE_PROGRESS_FILE, "utf8")).index, 1);
  assert(fs.readdirSync(path.join(work, ".backups")).length >= 2);
  const b = session();
  await b.wait("2/8 ·");
  await b.quit();
  console.log("✔ 터미널 코드 입력·취소·저장·문법 오류 수정·재검사·이동·백업·재시작 검증");

  fs.writeFileSync(env.COURSE_PROGRESS_FILE, JSON.stringify({ index: 8 }));
  const c = session();
  await c.wait("모든 실습을 통과했습니다.");
  await c.send(":run", "모델: 그중 가장 저렴한 곳은 [R-201]");
  await c.quit();
  assert.equal(JSON.parse(fs.readFileSync(env.COURSE_PROGRESS_FILE, "utf8")).finalRun, true);
  console.log("✔ 완료 상태에서 실제 서비스 대화 실행 검증");
} finally {
  // 삭제 대상은 이 테스트가 생성한 임시 폴더 한 곳으로 한정한다.
  assert.equal(path.dirname(path.resolve(tmp)), path.resolve(os.tmpdir()));
  assert(path.basename(tmp).startsWith("terminal-course-test-"));
  fs.rmSync(tmp, { recursive: true, force: true });
}

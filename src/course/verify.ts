import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { steps } from "./steps.js";
import { ROOT } from "../lib/paths.js";
import { startRun, endRun } from "../lib/trace.js";
import { llmCalls, roles, sentOf } from "../lib/harness.js";
import { buildSystemPrompt } from "../lib/rooms.js";
import type { Message } from "../lib/types.js";

process.env.LLM_MODE = "fake";
const work = process.env.COURSE_WORK_DIR ?? path.join(ROOT, "practice");
const load = (i: number): Promise<any> => import(pathToFileURL(path.join(work, steps[i].id + ".ts")).href);
const initial = (): Message[] => [{ role: "system", content: buildSystemPrompt() }];
const snapshot = (x: unknown) => JSON.stringify(x);
const tests: (() => Promise<void>)[] = [
  async () => {
    const { makeMessage } = await load(0);
    for (const text of ["안녕", "6명이 쓸 방", ""]) assert.deepEqual(makeMessage(text), { role: "user", content: text }, "입력한 글을 user 메시지에 그대로 넣어야 합니다");
  },
  async () => {
    const { appendQuestion } = await load(1);
    for (const history of [[], initial(), [...initial(), { role: "assistant" as const, content: "이전 답" }]]) {
      const before = snapshot(history);
      const next = appendQuestion(history, "다음 질문");
      assert.deepEqual(next, [...history, { role: "user", content: "다음 질문" }], "기존 메시지 뒤에 질문이 있어야 합니다");
      assert.equal(snapshot(history), before, "원본 배열이 바뀌었습니다");
      assert.notEqual(next, history, "새 배열을 반환해야 합니다");
    }
  },
  async () => {
    const { readReply } = await load(2);
    for (const text of ["준비 완료", "다른 결과"]) {
      let calls = 0;
      assert.equal(await readReply(async () => { calls++; await new Promise((r) => setTimeout(r, 5)); return { role: "assistant", content: text }; }), text, "기다린 뒤 content만 반환해야 합니다");
      assert.equal(calls, 1, "결과를 만드는 함수는 한 번만 호출하세요");
    }
    await assert.rejects(() => readReply(async () => { throw new Error("연습 오류"); }), /연습 오류/, "호출 오류를 정상 답처럼 바꾸면 안 됩니다");
  },
  async () => {
    const { firstCall } = await load(3);
    const reply = await firstCall("6명이 쓸 방 찾아 줘");
    const calls = llmCalls();
    assert.equal(calls.length, 1, "chat을 한 번 호출하세요");
    assert.deepEqual(sentOf(calls[0]), [...initial(), { role: "user", content: "6명이 쓸 방 찾아 줘" }], "system 안내문과 입력 질문을 순서대로 보내세요");
    assert.equal(reply.role, "assistant", "메시지 객체 전체를 반환하세요");
    assert.match(reply.content, /R-201/, "6명이 쓸 방이 답에 있어야 합니다");
  },
  async () => {
    const { newConversation } = await load(4);
    const a = newConversation(), b = newConversation();
    assert.deepEqual(a, initial(), "system 안내문 하나로 시작하세요");
    assert.notEqual(a, b, "호출마다 별개 배열이어야 합니다");
    a.push({ role: "user", content: "추가" });
    assert.deepEqual(b, initial(), "다른 대화가 함께 바뀌었습니다");
  },
  async () => checkConversation(5),
  async () => checkConversation(6),
  async () => {
    const { createChatService } = await load(7);
    const svc = createChatService();
    await svc.say("alice", "4명이 쓸 방 찾아 줘");
    assert.match(await svc.say("bob", "그중 가장 저렴한 곳은?"), /찾을 수 없/, "bob은 alice의 목록을 몰라야 합니다");
    assert.match(await svc.say("alice", "그중 가장 저렴한 곳은?"), /R-102/, "alice의 이전 답이 저장되지 않았습니다");
    await svc.say("bob", "6명이 쓸 방 찾아 줘");
    assert.match(await svc.say("bob", "그중 가장 저렴한 곳은?"), /R-201/, "다른 조건에서도 사용자별 기록이 유지되어야 합니다");
    assert.match(await createChatService().say("alice", "그중 가장 저렴한 곳은?"), /찾을 수 없/, "별개 서비스의 기록이 섞였습니다");
  },
];

async function checkConversation(index: number) {
  const { ask } = await load(index);
  const history = initial(), before = snapshot(history);
  const a = await ask(history, "4명이 쓸 방 찾아 줘");
  assert.equal(snapshot(history), before, "원본 history를 바꾸지 마세요");
  assert.equal(roles(a.messages), "system → user → assistant", "답의 글뿐 아니라 assistant 메시지 객체도 기록에 추가하세요");
  assert.equal(a.messages.at(-1).content, a.answer, "answer는 마지막 답의 content여야 합니다");
  const beforeFollow = snapshot(a.messages);
  const b = await ask(a.messages, "그중 가장 저렴한 곳은?");
  assert.equal(snapshot(a.messages), beforeFollow, "후속 질문에서도 원본 기록을 보존하세요");
  assert.equal(roles(b.messages), "system → user → assistant → user → assistant");
  assert.match(b.answer, /R-102/, "지난 추천 목록을 함께 보내야 합니다");
  const calls = llmCalls();
  assert.equal(calls.length, 2, "각 질문에 chat을 한 번씩 호출하세요");
  assert.equal(roles(sentOf(calls[1])), "system → user → assistant → user", "두 번째 호출에 지난 assistant 답이 빠졌습니다");
  assert.match((await ask(initial(), "그중 가장 저렴한 곳은?")).answer, /찾을 수 없/, "새 대화에 이전 기록이 섞였습니다");
}

const end = Number(process.argv[2]);
if (!Number.isInteger(end) || end < 0 || end >= steps.length) throw new Error("검사할 단계가 잘못되었습니다");
for (let i = 0; i <= end; i++) {
  startRun({ unit: "terminal-course", scenario: steps[i].id, kind: "check", impl: "practice" });
  try {
    await tests[i]();
    console.log(`✔ ${i + 1}. ${steps[i].title}`);
  } catch (error) {
    console.error(`✘ ${i + 1}. ${steps[i].title}\n${(error as Error).name}: ${(error as Error).message}`);
    process.exitCode = 1;
    break;
  } finally { endRun(); }
}

if (!process.exitCode && process.argv.includes("--demo")) {
  const { createChatService } = await load(7);
  const service = createChatService();
  console.log("\n── 직접 만든 서비스로 대화 실행 ──");
  for (const [user, question] of [
    ["alice", "4명이 쓸 방 찾아 줘"],
    ["bob", "그중 가장 저렴한 곳은?"],
    ["alice", "그중 가장 저렴한 곳은?"],
    ["bob", "6명이 쓸 방 찾아 줘"],
    ["bob", "그중 가장 저렴한 곳은?"],
  ]) console.log(`\n${user}: ${question}\n모델: ${await service.say(user, question)}`);
}

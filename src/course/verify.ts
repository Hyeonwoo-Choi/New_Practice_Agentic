import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { inspect, isDeepStrictEqual } from "node:util";
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
const format = (x: unknown) => inspect(x, { depth: 5, colors: false, compact: true, breakLength: 100, maxStringLength: 150, maxArrayLength: 8 });
const roleList = (x: unknown) => Array.isArray(x) ? roles(x) : format(x);
const end = Number(process.argv[2]);
if (!Number.isInteger(end) || end < 0 || end >= steps.length) throw new Error("검사할 단계가 잘못되었습니다");
let active = end, passed = 0, total = 0;
function expect(label: string, input: string, expected: unknown, actual: unknown, fix: string, predicate = isDeepStrictEqual(actual, expected)) {
  if (active === end) {
    total++;
    if (predicate) passed++;
    console.log(`\n${predicate ? "✔" : "✘"} 검사 ${total}: ${label}\n  입력: ${input}\n  기대: ${format(expected)}\n  실제: ${format(actual)}\n  판정: ${predicate ? "일치" : "불일치"}`);
    if (!predicate) console.log(`  고칠 부분: ${fix}`);
  }
  assert.ok(predicate, `${label}: ${fix}`);
}
const tests: (() => Promise<void>)[] = [
  async () => {
    const { makeMessage } = await load(0);
    for (const text of ["안녕", "6명이 쓸 방", ""]) expect("입력한 글을 user 메시지로 만들기", `makeMessage(${JSON.stringify(text)})`, { role: "user", content: text }, makeMessage(text), 'role은 "user", content에는 입력 변수 text를 넣으세요. 문자열 하나로 고정하면 다른 입력에서 실패합니다.');
  },
  async () => {
    const { appendQuestion } = await load(1);
    for (const history of [[], initial(), [...initial(), { role: "assistant" as const, content: "이전 답" }]]) {
      const before = snapshot(history);
      const next = appendQuestion(history, "다음 질문");
      expect("기존 목록 뒤에 질문 추가", `기존 ${JSON.parse(before).length}개, text="다음 질문"`, [...JSON.parse(before), { role: "user", content: "다음 질문" }], next, "기존 history를 펼친 뒤 user 메시지를 붙이세요.");
      expect("기존 배열 보존", "함수 호출 전후 history", JSON.parse(before), history, "history.push는 원본을 바꿉니다. 새 배열을 만들어 반환하세요.");
      expect("새 배열 반환", "next === history", false, next === history, "입력과 별개의 새 배열을 반환하세요.");
    }
  },
  async () => {
    const { readReply } = await load(2);
    for (const text of ["준비 완료", "다른 결과"]) {
      let calls = 0;
      const result = await readReply(async () => { calls++; await new Promise(r => setTimeout(r, 5)); return { role: "assistant", content: text }; });
      expect("답을 기다린 뒤 글 꺼내기", `fetchReply() → 나중에 content=${JSON.stringify(text)}`, text, result, "await fetchReply()로 메시지를 받은 뒤 content를 반환하세요.");
      expect("호출은 한 번", "fetchReply() 호출 횟수", 1, calls, "반환값을 받기 위해 한 번만 호출하세요.");
    }
    let error = "(오류가 전달되지 않음)";
    try { await readReply(async () => { throw new Error("연습 오류"); }); } catch (e) { error = (e as Error).message; }
    expect("호출 오류 전달", 'fetchReply()가 "연습 오류"를 발생시킴', "연습 오류", error, "실패를 정상 답처럼 바꾸지 말고 호출하는 쪽에 전달하세요.");
  },
  async () => {
    const { firstCall } = await load(3);
    const reply = await firstCall("6명이 쓸 방 찾아 줘");
    const calls = llmCalls();
    expect("모델을 실제로 호출", 'firstCall("6명이 쓸 방 찾아 줘")', 1, calls.length, "chat을 await로 한 번 호출하세요. 답을 직접 만들어 반환하는 것은 호출이 아닙니다.");
    const sent = sentOf(calls[0]);
    expect("보낸 메시지 순서", "모델에게 전달된 role", "system → user", roles(sent), "system 안내문 뒤에 user 질문을 넣으세요.");
    expect("업무 지침 전달", "첫 메시지 content", buildSystemPrompt(), sent[0]?.content, "system content는 buildSystemPrompt()입니다.");
    expect("입력 질문 전달", "마지막 메시지 content", "6명이 쓸 방 찾아 줘", sent.at(-1)?.content, "인자로 받은 question을 그대로 넣으세요.");
    expect("메시지 객체 반환", "모델 답의 role", "assistant", reply?.role, "chat이 반환한 메시지 객체 전체를 반환하세요.");
    expect("6명 조건의 답", "답에 포함된 방", "R-201 포함", reply?.content, "chat의 실제 답을 반환하세요.", typeof reply?.content === "string" && reply.content.includes("R-201"));
  },
  async () => {
    const { newConversation } = await load(4);
    const a = newConversation(), b = newConversation();
    expect("새 대화의 시작", "newConversation()", initial(), a, "system 메시지 하나가 든 배열을 반환하세요.");
    expect("서로 다른 배열", "첫 배열 === 두 번째 배열", false, a === b, "함수 안에서 배열을 새로 만드세요.");
    a.push({ role: "user", content: "추가" });
    expect("다른 대화에 영향 없음", "첫 배열에 질문 추가 후 두 번째 배열", initial(), b, "전역 공유 배열을 사용하지 마세요.");
  },
  async () => checkConversation(5),
  async () => checkConversation(6),
  async () => {
    const { createChatService } = await load(7);
    const svc = createChatService();
    await svc.say("alice", "4명이 쓸 방 찾아 줘");
    const bob = await svc.say("bob", "그중 가장 저렴한 곳은?");
    expect("bob에게 alice의 기록이 안 보임", 'alice 추천 후 bob: "그중 가장 저렴한 곳은?"', "찾을 수 없다는 답", bob, "사용자별 Map에 별도 기록을 저장하세요.", typeof bob === "string" && bob.includes("찾을 수 없"));
    const alice = await svc.say("alice", "그중 가장 저렴한 곳은?");
    expect("alice의 기록 유지", 'alice: "그중 가장 저렴한 곳은?"', "R-102 포함", alice, "ask 결과의 messages를 alice의 키에 저장하세요.", typeof alice === "string" && alice.includes("R-102"));
    await svc.say("bob", "6명이 쓸 방 찾아 줘");
    const bob2 = await svc.say("bob", "그중 가장 저렴한 곳은?");
    expect("bob의 다른 조건 유지", 'bob: 6명 추천 → 가장 저렴한 곳', "R-201 포함", bob2, "호출마다 Map을 새로 만들지 말고 say 밖에 보관하세요.", typeof bob2 === "string" && bob2.includes("R-201"));
    const fresh = await createChatService().say("alice", "그중 가장 저렴한 곳은?");
    expect("다른 서비스와 기록 분리", "새 서비스에서 alice가 후속 질문만 함", "찾을 수 없다는 답", fresh, "Map은 서비스 함수 안에서 새로 만드세요.", typeof fresh === "string" && fresh.includes("찾을 수 없"));
  },
];
async function checkConversation(index: number) {
  const { ask } = await load(index);
  const history = initial(), before = snapshot(history);
  const a = await ask(history, "4명이 쓸 방 찾아 줘");
  expect("첫 질문과 답을 모두 기록", 'ask([system], "4명이 쓸 방 찾아 줘")의 반환 기록', "system → user → assistant", roleList(a?.messages), "답의 글뿐 아니라 assistant 메시지 객체도 기록에 추가하세요.");
  expect("답의 글과 마지막 기록 일치", "answer와 마지막 메시지 content", a.messages.at(-1)?.content, a.answer, "answer는 reply.content입니다.");
  expect("원본 기록 보존", "첫 호출 전후의 history", JSON.parse(before), history, "history에 push하지 말고 새 배열을 만드세요.");
  const beforeFollow = snapshot(a.messages);
  const b = await ask(a.messages, "그중 가장 저렴한 곳은?");
  expect("후속 질문의 모델 입력", "두 번째 호출에 보낸 role", "system → user → assistant → user", llmCalls()[1] ? roles(sentOf(llmCalls()[1])) : "(호출 없음)", "지난 답을 다음 질문에 함께 보내세요.");
  expect("두 번째 답까지 기록", "후속 호출의 반환 기록", "system → user → assistant → user → assistant", roleList(b?.messages), "새 답까지 붙여 5개 메시지를 반환하세요.");
  expect("후속 질문 이해", '"그중 가장 저렴한 곳은?"', "R-102 포함", b.answer, "지난 추천 목록이 포함되어야 합니다.", typeof b.answer === "string" && b.answer.includes("R-102"));
  expect("후속 호출에서도 원본 보존", "첫 답 이후 기록", JSON.parse(beforeFollow), a.messages, "전달받은 배열은 바꾸지 마세요.");
  expect("질문당 한 번 호출", "질문 2개에 대한 모델 호출 수", 2, llmCalls().length, "각 질문에서 chat을 한 번만 호출하세요.");
  const fresh = await ask(initial(), "그중 가장 저렴한 곳은?");
  expect("새 대화의 독립성", "이전 목록 없는 새 대화에서 후속 질문", "찾을 수 없다는 답", fresh.answer, "함수 밖에 대화 기록을 공유하지 마세요.", typeof fresh.answer === "string" && fresh.answer.includes("찾을 수 없"));
}

const inputAt = process.argv.indexOf("--input");
if (inputAt >= 0) {
  const input = process.argv[inputAt + 1] ?? "";
  startRun({ unit: "terminal-course", scenario: steps[end].id + "-try", kind: "play", impl: "practice" });
  try {
    const mod = await load(end);
    console.log(`\n[직접 넣은 입력으로 실행 · 정답 판정은 :check]\n입력: ${format(input)}`);
    let result: unknown;
    if (end === 0) result = mod.makeMessage(input);
    else if (end === 1) result = mod.appendQuestion(initial(), input);
    else if (end === 2) result = await mod.readReply(async () => ({ role: "assistant", content: input }));
    else if (end === 3) result = await mod.firstCall(input);
    else if (end === 4) { result = mod.newConversation(); console.log("이 함수는 입력 인자를 사용하지 않습니다."); }
    else if (end === 5 || end === 6) {
      const a = await mod.ask(initial(), "4명이 쓸 방 찾아 줘");
      console.log("먼저 실행한 질문: 4명이 쓸 방 찾아 줘\n첫 답: " + a.answer);
      result = await mod.ask(a.messages, input);
    } else {
      const svc = mod.createChatService();
      console.log("먼저 alice에게 4명 방을 추천한 뒤 alice의 후속 질문으로 실행합니다.");
      await svc.say("alice", "4명이 쓸 방 찾아 줘");
      result = await svc.say("alice", input);
    }
    console.log("실제 반환값: " + format(result));
  } catch (e) { console.error("실행 실패: " + (e as Error).message); process.exitCode = 1; }
  finally { endRun(); }
} else {
  const start = process.argv.includes("--only") ? end : 0;
  for (let i = start; i <= end; i++) {
    active = i;
    startRun({ unit: "terminal-course", scenario: steps[i].id, kind: "check", impl: "practice" });
    try {
      await tests[i]();
      console.log(`✔ ${i + 1}. ${steps[i].title}${i < end ? " (이전 단계 재검사)" : ""}`);
    } catch (e) {
      console.error(`✘ ${i + 1}. ${steps[i].title}\n${(e as Error).name}: ${(e as Error).message}`);
      console.log(`수정할 파일: ${path.join(work, steps[i].id + ".ts")}\n해당 단계에서 :edit로 수정하세요.`);
      process.exitCode = 1; break;
    } finally { endRun(); }
  }
  console.log(active !== end && process.exitCode
    ? `\n${active + 1}번 단계가 실패해 현재 단계 검사는 시작하지 않았습니다. :back으로 해당 단계에 돌아가 고치세요.`
    : `\n현재 단계 실행 검사: ${passed}/${total} 일치${process.exitCode ? " · 실패한 지점에서 중단했습니다." : " · 통과"}`);
  if (!process.exitCode && process.argv.includes("--demo")) {
    const { createChatService } = await load(7);
    const svc = createChatService();
    console.log("\n── 직접 만든 서비스로 대화 실행 ──");
    for (const [user, question] of [["alice", "4명이 쓸 방 찾아 줘"], ["bob", "그중 가장 저렴한 곳은?"], ["alice", "그중 가장 저렴한 곳은?"], ["bob", "6명이 쓸 방 찾아 줘"], ["bob", "그중 가장 저렴한 곳은?"]]) console.log(`\n${user}: ${question}\n모델: ${await svc.say(user, question)}`);
  }
}

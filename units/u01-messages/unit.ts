/**
 * U01 · 메시지와 LLM 호출 — 단원 정의와 검사.
 * 검사는 출력 문구를 보지 않는다. 모델에 "무엇을 보냈는지" 와 돌려받은 기록을 본다.
 */
import { clip, llmCalls, roles, sentOf, turn } from "@lib/harness";
import { buildSystemPrompt } from "@lib/rooms";
import type { Message } from "@lib/types";
import type { CheckCase, CheckOutcome, Impl, UnitDef } from "@lib/unit";

type Conversation = {
  newConversation(): Message[];
  ask(history: Message[], question: string): Promise<{ messages: Message[]; answer: string }>;
};
type Apply = { createChatService(): { say(userId: string, question: string): Promise<string> } };

const Q1 = "내일 오후에 4명이 쓸 방 찾아 줘";
const Q2 = "그중 가장 저렴한 곳은?";
const CONCEPT = "units/u01-messages/03-concept.md";

const load = (impl: Impl) => impl.load<Conversation>("conversation");
const out = (pass: boolean, expected: string, actual: string): CheckOutcome => ({ pass, expected, actual });

const checks: CheckCase[] = [
  {
    id: "first-call",
    group: "main",
    title: "첫 질문: 시스템 안내 + 질문을 보내고, 답이 붙은 기록을 돌려준다",
    concept: `${CONCEPT} #messages-는-대화-전체다`,
    todo: { file: "conversation.ts", id: "U01-2" },
    async run(impl) {
      const { newConversation, ask } = await load(impl);
      const history = newConversation();
      const t = await turn(Q1, () => ask(history, Q1), { before: history });
      const call = llmCalls()[0];
      const sent = call ? sentOf(call) : [];
      const expected = "모델 1번 호출 · 보낸 messages = system → user(질문) · 돌려준 기록 = system → user → assistant";
      const actual = `모델 ${llmCalls().length}번 호출 · 보낸 messages = ${roles(sent)} · 돌려준 기록 = ${roles(t.messages ?? [])}`;
      const pass =
        llmCalls().length === 1 &&
        roles(sent) === "system → user" &&
        sent.at(-1)?.content === Q1 &&
        roles(t.messages ?? []) === "system → user → assistant" &&
        t.messages.at(-1)?.content === t.answer;
      return out(pass, expected, actual);
    },
  },
  {
    id: "followup-knows",
    group: "main",
    title: "후속 질문: 지난 질문과 지난 답을 함께 보낸다",
    concept: `${CONCEPT} #messages-는-대화-전체다`,
    todo: { file: "conversation.ts", id: "U01-2" },
    async run(impl) {
      const { newConversation, ask } = await load(impl);
      const t1 = await turn(Q1, () => ask(newConversation(), Q1));
      const t2 = await turn(Q2, () => ask(t1.messages, Q2), { before: t1.messages });
      const second = llmCalls()[1];
      const sent = second ? sentOf(second) : [];
      const expected = "두 번째 호출의 messages = system → user → assistant → user · 답에 가장 저렴한 R-102 가 나옴";
      const actual = `두 번째 호출의 messages = ${roles(sent)} · 답: ${clip(t2.answer)}`;
      return out(roles(sent) === "system → user → assistant → user" && t2.answer.includes("R-102"), expected, actual);
    },
  },
  {
    id: "fresh-no-memory",
    group: "main",
    title: "새 대화에서 후속 질문만 하면 모델은 '그중' 이 뭔지 모른다",
    concept: `${CONCEPT} #모델은-기억하지-않는다`,
    todo: { file: "conversation.ts", id: "U01-1" },
    async run(impl) {
      const { newConversation, ask } = await load(impl);
      // 앞에서 다른 대화를 했더라도, 새 대화는 깨끗해야 한다
      await ask(newConversation(), Q1);
      const t = await turn(Q2, () => ask(newConversation(), Q2));
      const calls = llmCalls();
      const sent = sentOf(calls[calls.length - 1]);
      const expected = "새 대화의 messages = system → user (앞 대화가 섞이지 않음) · 답은 '대화에서 찾을 수 없다'";
      const actual = `messages = ${roles(sent)} · 답: ${clip(t.answer)}`;
      return out(roles(sent) === "system → user" && t.answer.includes("찾을 수 없"), expected, actual);
    },
  },
  {
    id: "no-mutation",
    group: "main",
    title: "넘겨 준 대화 기록(history)을 몰래 바꾸지 않는다",
    concept: `${CONCEPT} #설계-선택-기록을-어떻게-돌려줄-것인가`,
    todo: { file: "conversation.ts", id: "U01-2" },
    async run(impl) {
      const { newConversation, ask } = await load(impl);
      const history = newConversation();
      const lengthBefore = history.length;
      await ask(history, Q1);
      const fresh = newConversation();
      const expected = "ask 뒤에도 넘긴 history 길이 그대로(1) · newConversation() 은 늘 길이 1 의 새 배열";
      const actual = `넘긴 history 길이 ${lengthBefore} → ${history.length} · 새 대화 길이 ${fresh.length}`;
      return out(history.length === lengthBefore && fresh.length === 1 && fresh !== history, expected, actual);
    },
  },
  {
    id: "system-once",
    group: "main",
    title: "system 메시지는 맨 앞에 한 번만 있다",
    concept: `${CONCEPT} #role-은-누가-한-말인가`,
    todo: { file: "conversation.ts", id: "U01-1" },
    async run(impl) {
      const { newConversation, ask } = await load(impl);
      const t1 = await ask(newConversation(), Q1);
      const t2 = await turn(Q2, () => ask(t1.messages, Q2));
      const sys = t2.messages.filter((m) => m.role === "system");
      const expected = "system 메시지 1개, 맨 앞이고 내용은 방 목록 안내문";
      const actual = `system ${sys.length}개 · 맨 앞 role = ${t2.messages[0]?.role}`;
      return out(sys.length === 1 && t2.messages[0]?.role === "system" && sys[0].content === buildSystemPrompt(), expected, actual);
    },
  },
  {
    id: "users-separate",
    group: "apply",
    title: "응용: 두 사용자의 대화가 섞이지 않는다",
    concept: "units/u01-messages/07-apply.md",
    todo: { file: "apply.ts", id: "U01-3" },
    async run(impl) {
      const { createChatService } = await impl.load<Apply>("apply");
      const chatSvc = createChatService();
      await turn(`(alice) ${Q1}`, async () => ({ answer: await chatSvc.say("alice", Q1) }), { who: "alice" });
      const bob = await turn(`(bob) ${Q2}`, async () => ({ answer: await chatSvc.say("bob", Q2) }), { who: "bob" });
      const alice2 = await turn(`(alice) ${Q2}`, async () => ({ answer: await chatSvc.say("alice", Q2) }), { who: "alice" });
      const c = llmCalls();
      const bobSent = c[1] ? sentOf(c[1]) : [];
      const aliceSent = c[2] ? sentOf(c[2]) : [];
      const expected = "bob 의 첫 질문 messages = system → user · bob 은 '찾을 수 없다' · alice 후속은 system → user → assistant → user 이고 R-102";
      const actual = `bob messages = ${roles(bobSent)}, bob 답: ${clip(bob.answer, 30)} · alice messages = ${roles(aliceSent)}, alice 답: ${clip(alice2.answer, 30)}`;
      const pass =
        roles(bobSent) === "system → user" &&
        bob.answer.includes("찾을 수 없") &&
        roles(aliceSent) === "system → user → assistant → user" &&
        alice2.answer.includes("R-102");
      return out(pass, expected, actual);
    },
  },
  {
    id: "users-system-once",
    group: "apply",
    title: "응용: 사용자마다 system 안내문이 한 번씩, 맨 앞에",
    concept: "units/u01-messages/07-apply.md",
    todo: { file: "apply.ts", id: "U01-3" },
    async run(impl) {
      const { createChatService } = await impl.load<Apply>("apply");
      const chatSvc = createChatService();
      await chatSvc.say("alice", Q1);
      await chatSvc.say("alice", Q2);
      await chatSvc.say("bob", Q1);
      const sentList = llmCalls().map(sentOf);
      const counts = sentList.map((s) => s.filter((m) => m.role === "system").length);
      const expected = "모든 호출에서 system 은 정확히 1개 (alice 첫·둘째, bob 첫)";
      const actual = `호출별 system 개수 = [${counts.join(", ")}]`;
      return out(counts.length === 3 && counts.every((n) => n === 1) && sentList.every((s) => s[0]?.role === "system"), expected, actual);
    },
  },
];

const unit: UnitDef = {
  id: "u01-messages",
  title: "U01 · 메시지와 LLM 호출",
  minutes: 45,
  concept: "모델은 기억하지 않는다. 호출할 때마다 보낸 messages 가 대화의 전부다.",
  layers: ["flow", "llm"],
  structure: {
    nodes: [
      { id: "question", label: "질문", layer: "flow" },
      { id: "llm", label: "모델 호출", layer: "llm" },
      { id: "answer", label: "응답", layer: "flow" },
    ],
    edges: [
      { from: "question", to: "llm" },
      { from: "llm", to: "answer" },
    ],
  },
  predictions: [
    {
      id: "P1",
      prompt: "첫 질문을 보낼 때, 모델에 보낸 messages 는 몇 개인가? (system 포함)",
      runOf: "first-call",
      llmIndex: 0,
      actual: (ctx) => {
        const e = ctx.checkRuns["first-call"]?.events.find((x) => x.type === "llm_call");
        return e ? String((e.data.sent as unknown[]).length) : undefined;
      },
    },
    {
      id: "P2",
      prompt: "후속 질문('그중 가장 저렴한 곳은?')을 보낼 때, 모델에 보낸 messages 는 몇 개인가?",
      runOf: "followup-knows",
      llmIndex: 1,
      actual: (ctx) => {
        const calls = ctx.checkRuns["followup-knows"]?.events.filter((x) => x.type === "llm_call") ?? [];
        return calls[1] ? String((calls[1].data.sent as unknown[]).length) : undefined;
      },
    },
    {
      id: "P3",
      prompt: "새 대화에서 후속 질문만 보내면? A) 가장 저렴한 방을 알려 준다  B) 무엇을 말하는지 모른다고 한다",
      options: ["A", "B"],
      runOf: "fresh-no-memory",
      llmIndex: -1,
      actual: (ctx) => {
        const e = ctx.checkRuns["fresh-no-memory"]?.events.filter((x) => x.type === "llm_call").at(-1);
        const reply = (e?.data.reply as { content?: string } | undefined)?.content;
        return reply === undefined ? undefined : reply.includes("찾을 수 없") ? "B" : "A";
      },
    },
    {
      id: "P4",
      prompt: "실험 e1(AI 가 쓴 코드: 답을 기록에 안 붙임)을 5개 기본 검사에 돌리면 몇 개가 실패하나?",
      actual: (ctx) => (ctx.experiments["e1"] ? String(ctx.experiments["e1"].failed.length) : undefined),
    },
    {
      id: "P5",
      prompt: "실험 e2(AI 가 쓴 코드: 전역 변수에 기록 보관)를 돌리면 몇 개가 실패하나?",
      actual: (ctx) => (ctx.experiments["e2"] ? String(ctx.experiments["e2"].failed.length) : undefined),
    },
  ],
  checks,
  experiments: [
    { id: "e1", title: "AI 가 쓴 코드 ① 답을 기록에 안 붙인다", file: "experiments/e1-forget-reply" },
    { id: "e2", title: "AI 가 쓴 코드 ② 전역 변수에 기록을 둔다", file: "experiments/e2-global-history" },
  ],
  async play(impl) {
    const { newConversation, ask } = await load(impl);
    const t1 = await turn(Q1, () => ask(newConversation(), Q1));
    console.log(`\n나:   ${Q1}\n모델: ${t1.answer}`);
    const t2 = await turn(Q2, () => ask(t1.messages, Q2), { before: t1.messages });
    console.log(`\n나:   ${Q2}\n모델: ${t2.answer}`);
  },
};

export default unit;

export type Step = {
  id: string;
  title: string;
  purpose: string;
  input: string;
  problem: string;
  expected: string;
  hint: string;
  imports?: string;
  signature: string;
  starter: string;
};

export const steps: Step[] = [
  {
    id: "01-message", title: "사용자의 말을 메시지로 만들기",
    purpose: "입력한 글에 user라는 이름표를 붙입니다. 이후 모델에 보내는 재료 한 개를 만드는 단계입니다. 아직 AI를 호출하지 않습니다.",
    input: 'text = "안녕" (함수를 실행하는 검사기가 넣어 줍니다)',
    problem: "사용자가 입력한 글을 모델에 전달할 메시지 객체로 바꾸세요. makeMessage(text)를 구현합니다.",
    expected: 'makeMessage("안녕") → { role: "user", content: "안녕" }. 다른 글도 그대로 담겨야 합니다.',
    hint: '객체는 { 속성: 값 }입니다. role은 "user", content는 인자로 받은 text입니다.',
    signature: "export function makeMessage(text: string): Message",
    imports: 'import type { Message } from "@lib/types";',
    starter: '  return { role: "user", content: "연습" };',
  },
  {
    id: "02-history", title: "원본을 보존하며 질문 추가하기",
    purpose: "1번에서 만든 메시지를 여러 개 모읍니다. 이번에는 기존 목록을 건드리지 않고 질문 하나를 추가합니다.",
    input: 'history = 기존 메시지 배열, text = "다음 질문"',
    problem: "기존 메시지 배열 뒤에 새 사용자 메시지를 붙인 새 배열을 반환하세요. 원래 배열은 바꾸지 않습니다.",
    expected: '기존 1개 + 질문 → 새 배열 2개. 원래 배열은 1개 그대로. 빈 배열 + 질문 → 1개.',
    hint: '[...history, 새객체]는 history의 내용을 펼친 뒤 새 객체를 추가한 배열입니다.',
    imports: 'import type { Message } from "@lib/types";',
    signature: "export function appendQuestion(history: Message[], text: string): Message[]",
    starter: '  return [];',
  },
  {
    id: "03-await", title: "늦게 도착하는 결과 기다리기",
    purpose: "다음 단계의 모델 답을 기다리기 위한 준비입니다. 지금은 작은 연습 함수를 기다리고 답의 글만 꺼냅니다.",
    input: 'fetchReply = 나중에 { role: "assistant", content: "준비 완료" }를 돌려주는 함수',
    problem: "fetchReply()가 돌려주는 Promise를 기다려 메시지를 받고, 메시지 객체가 아닌 답의 글만 반환하세요.",
    expected: 'fetchReply가 나중에 { role: "assistant", content: "준비 완료" }를 반환하면 결과는 "준비 완료".',
    hint: 'const reply = await fetchReply();로 기다린 뒤 reply의 content를 꺼내세요.',
    imports: 'import type { Message } from "@lib/types";',
    signature: "export async function readReply(fetchReply: () => Promise<Message>): Promise<string>",
    starter: '  return "아직 기다리지 않음";',
  },
  {
    id: "04-call", title: "모델에 첫 질문 보내기",
    purpose: "메시지 배열과 await를 합쳐 처음으로 연습용 모델을 호출합니다. 여기서는 답을 한 번 받기만 합니다.",
    input: 'question = "4명이 쓸 방 찾아 줘" 또는 "6명이 쓸 방 찾아 줘"',
    problem: "system 안내문과 user 질문을 배열로 만들어 chat에 보내세요. 모델이 반환한 메시지 객체를 그대로 반환합니다. system은 개발자가 정한 기본 지침, user는 사용자 입력입니다.",
    expected: '질문 "4명이 쓸 방 찾아 줘" → assistant 메시지. 보낸 순서는 system → user. 모델 호출은 한 번.',
    hint: 'system의 content는 buildSystemPrompt()입니다. Message[] 배열을 만들고 await chat(배열)을 호출하세요.',
    imports: 'import { chat } from "@lib/llm";\nimport { buildSystemPrompt } from "@lib/rooms";\nimport type { Message } from "@lib/types";',
    signature: "export async function firstCall(question: string): Promise<Message>",
    starter: '  return { role: "assistant", content: "아직 모델을 호출하지 않음" };',
  },
  {
    id: "05-start", title: "서로 독립적인 새 대화 만들기",
    purpose: "이어지는 대화를 만들기 전에 출발 상태를 준비합니다. 사람마다 별개 대화를 만들 수 있어야 합니다.",
    input: "입력 인자 없음. newConversation()을 두 번 호출해 서로 영향을 주는지 검사합니다.",
    problem: "system 안내문 하나만 있는 새 메시지 배열을 만드세요. 매번 호출할 때 별개의 배열이어야 합니다.",
    expected: 'newConversation() → [system]. 두 번 호출한 배열은 서로 다름. 한쪽을 수정해도 다른 쪽은 그대로.',
    hint: '함수 안에서 배열을 새로 만들고 반환하세요. 안내문 내용은 buildSystemPrompt()를 사용합니다.',
    imports: 'import { buildSystemPrompt } from "@lib/rooms";\nimport type { Message } from "@lib/types";',
    signature: "export function newConversation(): Message[]",
    starter: '  return [];',
  },
  {
    id: "06-conversation", title: "첫 답을 저장하고 이어 묻기",
    purpose: "4번의 한 번 호출을 확장합니다. 이전 답을 다음 질문에 함께 보내어 ‘그중’이 무엇인지 알게 합니다.",
    input: 'history = 지금까지의 메시지, question = "4명이 쓸 방 찾아 줘" 다음에 "그중 가장 저렴한 곳은?"',
    problem: "history 뒤에 user 질문을 붙여 chat을 호출하고, 받은 assistant 답까지 붙인 새 기록과 답의 글을 반환하세요. chat은 답을 자동으로 기록하지 않습니다.",
    expected: '첫 질문: 2개를 보내고 3개 기록 반환. 후속 질문: 4개를 보내고 5개 반환. "그중 가장 저렴한 곳은?" → R-102. 원래 history는 그대로.',
    hint: '보낼 배열 = history + user. 반환할 messages = 보낸 배열 + reply. answer = reply.content. 두 배열 모두 새로 만드세요.',
    imports: 'import { chat } from "@lib/llm";\nimport type { Message } from "@lib/types";',
    signature: "export async function ask(history: Message[], question: string): Promise<{ messages: Message[]; answer: string }>",
    starter: '  return { messages: [...history], answer: "아직 질문하지 않음" };',
  },
  {
    id: "07-repair", title: "답을 잃어버리는 코드 고치기",
    purpose: "새로운 문법 없이, 6번에서 배운 기록 관리를 결함 수정으로 확인합니다. 반환하는 배열 한 곳이 핵심입니다.",
    input: '첫 질문과 “그중 가장 저렴한 곳은?”이라는 후속 질문',
    problem: "아래 코드는 첫 답을 보여 주지만 다음 질문에 실패합니다. 실행 검사로 원인을 확인하고 함수를 고치세요. 별도의 설명문은 작성하지 않습니다.",
    expected: '반환 기록의 마지막은 assistant. 이어서 "그중 가장 저렴한 곳은?"을 물어도 추천 목록을 이해해야 함.',
    hint: 'answer에 글을 넣는 것과 messages에 메시지 객체를 넣는 것은 다릅니다. 반환하는 messages를 살펴보세요.',
    imports: 'import { chat } from "@lib/llm";\nimport type { Message } from "@lib/types";',
    signature: "export async function ask(history: Message[], question: string): Promise<{ messages: Message[]; answer: string }>",
    starter: '  const messages: Message[] = [...history, { role: "user", content: question }];\n  const reply = await chat(messages);\n  return { messages, answer: reply.content };',
  },
  {
    id: "08-users", title: "두 사용자의 대화 분리하기",
    purpose: "앞에서 만든 대화 함수를 재사용합니다. alice와 bob의 기록을 나눠 서로의 대화를 보지 못하게 합니다.",
    input: 'say(userId, question)에 사용자 ID와 질문을 번갈아 넣습니다.',
    problem: "alice와 bob이 번갈아 질문합니다. 사용자 ID별로 기록을 저장하는 서비스를 만드세요. newConversation과 ask는 앞 단계에서 작성한 함수를 가져왔습니다. 서비스마다 보관함도 독립적이어야 합니다.",
    expected: 'alice: 4명 방 추천 → 목록. bob: 그중 싼 곳? → 대화에서 찾을 수 없음. alice: 그중 싼 곳? → R-102. 새 서비스도 이전 대화를 몰라야 함.',
    hint: '함수 안에 Map<string, Message[]>를 만들고, { async say(userId, question) { ... } }를 반환하세요. get으로 조회하고 없으면 새 대화. ask 뒤 set으로 갱신하고 answer 반환. Map은 say 밖에 둡니다.',
    imports: 'import { newConversation } from "./05-start.js";\nimport { ask } from "./06-conversation.js";\nimport type { Message } from "@lib/types";',
    signature: "export function createChatService(): { say(userId: string, question: string): Promise<string> }",
    starter: '  return {\n    async say(userId, question) {\n      return "아직 사용자 기록을 저장하지 않음";\n    }\n  };',
  },
];

export function sourceFor(step: Step): string {
  return `${step.imports ?? ""}\n\n${step.signature} {\n// EDIT-BEGIN\n${step.starter}\n// EDIT-END\n}\n`;
}

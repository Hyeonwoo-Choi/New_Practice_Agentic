/**
 * U01 · 내가 쓰는 파일 ①  (이 파일은 work/ 로 복사된 것이니 마음껏 고치세요)
 *
 * 해야 할 일은 두 가지입니다. 순서대로 하세요.
 *   첫째 (U01-1)  newConversation() — 새 대화를 시작할 때의 messages 를 만든다
 *   둘째 (U01-2)  ask()             — 질문을 이어 붙여 모델을 부르고, 답까지 붙은 새 기록을 돌려준다
 * 고칠 자리는 아래에서 "TODO" 라고 적힌 주석을 찾으세요.
 *
 * 확인:  npm run check -- u01
 * 막히면: npm run hint -- u01 1   (개념 → 의사코드 → 부분 코드 순서로 3단계)
 */
import { chat } from "@lib/llm";
import { notImplemented } from "@lib/learn";
import { buildSystemPrompt } from "@lib/rooms";
import type { Message } from "@lib/types";

/** ask() 가 돌려주는 것: 이어진 대화 기록 전체 + 방금 받은 답의 글 */
export type Turn = { messages: Message[]; answer: string };

/**
 * 새 대화의 시작 messages. 맨 앞에 system 메시지 한 개를 둔다.
 * system 의 내용은 buildSystemPrompt() 가 만들어 준다 (방 목록 안내문).
 */
export function newConversation(): Message[] {
  // TODO(U01-1): system 메시지 한 개가 들어 있는 새 배열을 돌려주세요.
  return notImplemented("U01-1", "newConversation() 이 system 메시지가 든 배열을 돌려주게 만드세요");
}

/**
 * history(지금까지의 대화) 뒤에 question 을 user 메시지로 붙여 모델을 부른다.
 * 약속: 넘겨 받은 history 배열은 바꾸지 않는다. 이어 붙인 "새 배열" 을 돌려준다.
 */
export async function ask(history: Message[], question: string): Promise<Turn> {
  // TODO(U01-2): ① history + user 메시지로 새 배열을 만든다
  //              ② chat(...) 을 await 로 부른다 (chat 은 assistant 메시지 하나를 돌려준다)
  //              ③ 답까지 붙은 새 배열과 답의 글(content)을 돌려준다
  void chat; // 지우세요. 지금은 import 가 쓰이지 않는다고 오류가 나지 않게 둔 줄입니다
  return notImplemented("U01-2", "ask() 가 모델을 부르고 { messages, answer } 를 돌려주게 만드세요");
}

void buildSystemPrompt; // 지우세요. U01-1 에서 쓰게 됩니다

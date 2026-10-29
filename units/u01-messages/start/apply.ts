/**
 * U01 · 내가 쓰는 파일 ② 응용 문제  (07-apply.md 를 읽고 시작하세요. 힌트는 1단계(개념)만 준비돼 있습니다)
 *
 * 한 서비스에 alice 와 bob 이 동시에 말을 겁니다.
 * 두 사람의 대화가 서로 섞이면 안 됩니다. ① 위에서 만든 newConversation · ask 를 그대로 쓰세요.
 *
 * 확인:  npm run check -- u01 --apply
 */
import { notImplemented } from "@lib/learn";
// import { newConversation, ask } from "./conversation.js";

export function createChatService() {
  // TODO(U01-3): say(userId, question) 이 사용자별로 자기 대화만 이어 가게 만드세요.
  return {
    async say(userId: string, question: string): Promise<string> {
      void userId;
      void question;
      return notImplemented("U01-3", "사용자마다 대화 기록을 따로 보관해 ask() 에 넘기세요");
    },
  };
}

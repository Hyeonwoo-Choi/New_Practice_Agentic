/**
 * 결정적인 fake LLM — 네트워크도 키도 없이 같은 입력이면 늘 같은 답을 한다.
 *
 * 규칙: 이 함수는 "받은 messages" 만 본다. 안에 기억이 없다 (모듈 변수도 없다).
 *       그래서 지난 대화를 보내 주지 않으면 지난 대화를 모른다 — 실제 LLM API 와 같다.
 *       학습자가 구현해야 할 일(대화 기록 관리 등)은 이 파일이 대신해 주지 않는다.
 */
import { loadRoomData, roomLine, won, type Room } from "./rooms.js";
import type { Message } from "./types.js";

const answer = (content: string): Message => ({ role: "assistant", content });
const idsIn = (text: string) => [...text.matchAll(/\[(R-\d{3})\]/g)].map((m) => m[1]);

export function fakeChat(messages: Message[]): Message {
  const { rooms } = loadRoomData();
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  if (!lastUser) return answer("질문이 없습니다. user 메시지를 보내 주세요.");

  const people = lastUser.match(/(\d+)\s*명/);
  if (people) {
    const n = Number(people[1]);
    const fit = rooms.filter((r) => r.capacity >= n);
    if (!fit.length) return answer(`${n}명이 쓸 수 있는 방이 없습니다.`);
    return answer([`${n}명이 쓸 수 있는 방입니다:`, ...fit.map((r) => `- ${roomLine(r)}`)].join("\n"));
  }

  if (/저렴|싼/.test(lastUser)) {
    // 지난 assistant 답에 나온 방만 후보로 본다 (system 의 전체 목록은 '그중' 이 아니다)
    const lastListing = [...messages].reverse().find((m) => m.role === "assistant" && idsIn(m.content).length > 0);
    if (!lastListing) return answer("어떤 방들 중에서 고르라는 말씀인지 대화에서 찾을 수 없습니다. 먼저 인원을 알려 주세요.");
    const ids = idsIn(lastListing.content);
    const cands = rooms.filter((r) => ids.includes(r.id));
    const cheapest = cands.reduce((a: Room, b: Room) => (b.pricePerHour < a.pricePerHour ? b : a));
    return answer(`그중 가장 저렴한 곳은 ${roomLine(cheapest)} 입니다. 2시간이면 ${won(cheapest.pricePerHour * 2)} 입니다.`);
  }

  return answer(`(fake) "${lastUser.slice(0, 30)}" 은 이해하지 못했습니다. 인원을 말해 보세요. 예: 4명이 쓸 방`);
}

import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./paths.js";

export type Room = { id: string; name: string; capacity: number; pricePerHour: number; floor: number; equipment: string[] };
type RoomData = { today: string; rooms: Room[]; booked: { roomId: string; date: string; start: string; end: string }[] };

export function loadRoomData(): RoomData {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "data", "rooms.json"), "utf8"));
}

export const won = (n: number) => `${n.toLocaleString("en-US")}원`;
export const roomLine = (r: Room) => `[${r.id}] ${r.name} · ${r.capacity}명 · ${won(r.pricePerHour)}/시간`;

/**
 * 시스템 메시지로 쓸 안내문. U01 에서는 도구가 아직 없어서 방 목록을 글로 넣어 준다.
 * (U02 에서 이 방식의 한계를 보고 '도구' 로 바꾼다)
 */
export function buildSystemPrompt(): string {
  const { rooms, today } = loadRoomData();
  return [
    `너는 스터디룸 예약 도우미다. 오늘은 ${today} 이다. 아래 방 목록만 근거로 짧게 답한다.`,
    "방 목록:",
    ...rooms.map((r) => `- ${roomLine(r)}`),
  ].join("\n");
}

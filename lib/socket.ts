import type { Server } from "socket.io";

export type FahrduellIo = Server | undefined;

export function getIo(): FahrduellIo {
  return (globalThis as unknown as { fahrduellIo?: Server }).fahrduellIo;
}

export function sessionRoom(sessionId: string) {
  return `session:${sessionId}`;
}

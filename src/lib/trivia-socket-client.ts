"use client";

import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@/lib/trivia-events";

type TriviaSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

declare global {
  interface Window {
    __triviaSocket?: TriviaSocket;
  }
}

export function getTriviaSocket(token: string): TriviaSocket {
  const existing = window.__triviaSocket;
  if (existing && existing.connected) return existing;
  if (existing) existing.disconnect();

  const url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";
  const socket: TriviaSocket = io(url, { path: "/socket.io", auth: { token }, transports: ["websocket"] });
  window.__triviaSocket = socket;
  return socket;
}

export function getConnectedTriviaSocket(): TriviaSocket | null {
  const socket = window.__triviaSocket;
  return socket && socket.connected ? socket : null;
}

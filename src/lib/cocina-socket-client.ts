"use client";

import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@/lib/cocina-events";

type CocinaSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

declare global {
  interface Window {
    __cocinaSocket?: CocinaSocket;
  }
}

export function getCocinaSocket(token: string): CocinaSocket {
  const existing = window.__cocinaSocket;
  if (existing && existing.connected) return existing;
  if (existing) existing.disconnect();

  const url = process.env.NEXT_PUBLIC_COCINA_SOCKET_URL || "http://localhost:4002";
  const socket: CocinaSocket = io(url, {
    path: "/cocina-socket.io",
    auth: { token },
    transports: ["websocket"],
  });
  window.__cocinaSocket = socket;
  return socket;
}

export function getConnectedCocinaSocket(): CocinaSocket | null {
  if (typeof window === "undefined") return null;
  const socket = window.__cocinaSocket;
  return socket && socket.connected ? socket : null;
}

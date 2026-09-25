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

const CONNECT_TIMEOUT_MS = 8000;

/**
 * Emits an event and resolves with the ack, but rejects if the socket never
 * connects (network blocked, wrong server URL, etc.) instead of hanging forever.
 */
export function emitWithTimeout<T>(socket: CocinaSocket, event: string, payload?: unknown): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const onConnectError = (err: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(`No se pudo conectar al servidor de la sala (${err.message}).`));
    };
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("No se pudo conectar al servidor de la sala (tiempo de espera agotado)."));
    }, CONNECT_TIMEOUT_MS);
    function cleanup() {
      clearTimeout(timer);
      socket.off("connect_error", onConnectError);
    }
    socket.on("connect_error", onConnectError);
    const ack = (res: T) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(res);
    };
    const emit = socket.emit.bind(socket) as (...args: unknown[]) => void;
    if (payload === undefined) {
      emit(event, ack);
    } else {
      emit(event, payload, ack);
    }
  });
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { getTriviaSocketToken } from "@/server/actions/trivias";
import { getTriviaSocket } from "@/lib/trivia-socket-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function JoinRoomForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().length < 4) return;
    setError(null);

    startTransition(async () => {
      const token = await getTriviaSocketToken();
      const socket = getTriviaSocket(token);
      const normalized = code.trim().toUpperCase();

      const res = await new Promise<{ ok: true } | { error: string }>((resolve) => {
        socket.emit("room:join", { code: normalized }, resolve);
      });

      if ("error" in res) {
        setError(res.error);
        return;
      }
      router.push(`/didacticas/trivias/room/${normalized}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex flex-col gap-2">
        <label htmlFor="room-code" className="text-sm font-medium">
          Unirse con código
        </label>
        <Input
          id="room-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABC123"
          maxLength={6}
          className="w-32 text-center font-mono tracking-widest uppercase"
        />
      </div>
      <Button type="submit" disabled={isPending || code.trim().length < 4} className="gap-1.5">
        <LogIn className="size-4" /> {isPending ? "Entrando..." : "Unirme"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}

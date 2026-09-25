"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { getCocinaSocketToken } from "@/server/actions/cocina";
import { emitWithTimeout, getCocinaSocket } from "@/lib/cocina-socket-client";
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
      const normalized = code.trim().toUpperCase();
      try {
        const token = await getCocinaSocketToken();
        const socket = getCocinaSocket(token);

        const res = await emitWithTimeout<{ ok: true } | { error: string }>(socket, "room:join", { code: normalized });

        if ("error" in res) {
          setError(res.error);
          return;
        }
        router.push(`/didacticas/cocina-loca/room/${normalized}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo unir a la sala.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex flex-col gap-2">
        <label htmlFor="cocina-room-code" className="text-sm font-medium">
          Unirse con código
        </label>
        <Input
          id="cocina-room-code"
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

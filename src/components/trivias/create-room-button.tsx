"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Rocket } from "lucide-react";
import { getTriviaSocketToken } from "@/server/actions/trivias";
import { getTriviaSocket } from "@/lib/trivia-socket-client";
import { Button } from "@/components/ui/button";

export function CreateRoomButton({ triviaId }: { triviaId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const token = await getTriviaSocketToken();
      const socket = getTriviaSocket(token);

      const res = await new Promise<{ code: string } | { error: string }>((resolve) => {
        socket.emit("room:create", { triviaId }, resolve);
      });

      if ("error" in res) {
        setError(res.error);
        return;
      }
      router.push(`/didacticas/trivias/room/${res.code}?host=1`);
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <Button size="sm" onClick={handleClick} disabled={isPending} className="gap-1.5">
        <Rocket className="size-4" /> {isPending ? "Creando sala..." : "Crear sala"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

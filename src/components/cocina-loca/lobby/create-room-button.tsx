"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChefHat } from "lucide-react";
import { getCocinaSocketToken } from "@/server/actions/cocina";
import { getCocinaSocket } from "@/lib/cocina-socket-client";
import { Button } from "@/components/ui/button";

export function CreateRoomButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const token = await getCocinaSocketToken();
      const socket = getCocinaSocket(token);

      const res = await new Promise<{ code: string } | { error: string }>((resolve) => {
        socket.emit("room:create", resolve);
      });

      if ("error" in res) {
        setError(res.error);
        return;
      }
      router.push(`/didacticas/cocina-loca/room/${res.code}?host=1`);
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <Button onClick={handleClick} disabled={isPending} className="gap-1.5">
        <ChefHat className="size-4" /> {isPending ? "Creando sala..." : "Crear sala"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

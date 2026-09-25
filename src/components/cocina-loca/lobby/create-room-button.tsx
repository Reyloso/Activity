"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChefHat } from "lucide-react";
import { getCocinaSocketToken } from "@/server/actions/cocina";
import { emitWithTimeout, getCocinaSocket } from "@/lib/cocina-socket-client";
import { Button } from "@/components/ui/button";

export function CreateRoomButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const token = await getCocinaSocketToken();
        const socket = getCocinaSocket(token);

        const res = await emitWithTimeout<{ code: string } | { error: string }>(socket, "room:create");

        if ("error" in res) {
          setError(res.error);
          return;
        }
        router.push(`/didacticas/cocina-loca/room/${res.code}?host=1`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo crear la sala.");
      }
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

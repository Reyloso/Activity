"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteActivity } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";

export function DeleteActivityButton({ activityId, activityTitle }: { activityId: string; activityTitle: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={isPending}
      onClick={() => {
        if (!confirm(`¿Eliminar la actividad "${activityTitle}"? Esta acción no se puede deshacer.`)) return;
        startTransition(() => deleteActivity(activityId));
      }}
    >
      <Trash2 className="size-4" /> Eliminar
    </Button>
  );
}

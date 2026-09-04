"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteGroup } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";

export function DeleteGroupButton({ groupId, groupName }: { groupId: string; groupName: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm(`¿Eliminar el grupo "${groupName}"? Se quitará el acceso que tenía a sus actividades.`)) return;
        startTransition(() => deleteGroup(groupId));
      }}
    >
      <Trash2 className="size-4" /> Eliminar
    </Button>
  );
}

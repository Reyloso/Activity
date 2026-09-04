"use client";

import { useTransition } from "react";
import { Ban, ShieldCheck, Trash2 } from "lucide-react";
import { deleteUser, setUserBlocked } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";

export function UserRowActions({
  userId,
  userLabel,
  isBlocked,
  disabled,
}: {
  userId: string;
  userLabel: string;
  isBlocked: boolean;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1.5">
      <Button
        size="sm"
        variant="outline"
        disabled={disabled || isPending}
        onClick={() => startTransition(() => setUserBlocked(userId, !isBlocked))}
      >
        {isBlocked ? (
          <>
            <ShieldCheck className="size-4" /> Desbloquear
          </>
        ) : (
          <>
            <Ban className="size-4" /> Bloquear
          </>
        )}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={disabled || isPending}
        onClick={() => {
          if (!confirm(`¿Eliminar a ${userLabel}? Esta acción no se puede deshacer.`)) return;
          startTransition(() => deleteUser(userId));
        }}
      >
        <Trash2 className="size-4" /> Eliminar
      </Button>
    </div>
  );
}

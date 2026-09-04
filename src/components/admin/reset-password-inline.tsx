"use client";

import { useActionState, useState } from "react";
import { KeyRound } from "lucide-react";
import { resetUserPassword, type ResetPasswordState } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ResetPasswordState = { error: null, success: false };

export function ResetPasswordInline({ userId, disabled }: { userId: string; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(resetUserPassword.bind(null, userId), initialState);

  if (!open) {
    return (
      <Button size="sm" variant="outline" disabled={disabled} onClick={() => setOpen(true)}>
        <KeyRound className="size-4" /> Restablecer contraseña
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-md border bg-secondary/30 p-3">
      <div className="flex items-center gap-2">
        <Input
          name="newPassword"
          type="password"
          placeholder="Nueva contraseña"
          minLength={8}
          required
          className="h-8 w-48"
        />
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Guardando..." : "Guardar"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
      {state.error && <p className="text-xs text-destructive">{state.error}</p>}
      {state.success && <p className="text-xs text-emerald-600">Contraseña actualizada.</p>}
    </form>
  );
}

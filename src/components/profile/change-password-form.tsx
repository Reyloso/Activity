"use client";

import { useActionState } from "react";
import { changeOwnPassword, type ChangePasswordState } from "@/server/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ChangePasswordState = { error: null, success: false };

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changeOwnPassword, initialState);

  return (
    <form action={formAction} key={state.success ? "done" : "form"} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="currentPassword">Contraseña actual</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="newPassword">Nueva contraseña</Label>
        <Input id="newPassword" name="newPassword" type="password" required minLength={8} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-600">Contraseña actualizada correctamente.</p>}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando..." : "Actualizar contraseña"}
      </Button>
    </form>
  );
}

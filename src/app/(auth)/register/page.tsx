"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerUser, type RegisterState } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: RegisterState = { error: null, success: false };

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerUser, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Crea tu cuenta</CardTitle>
          <CardDescription>Regístrate con tu correo corporativo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" name="lastName" required />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Correo corporativo</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required minLength={8} />
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            {state.success && (
              <p className="text-sm text-emerald-600">
                Cuenta creada. <Link href="/login" className="underline">Inicia sesión</Link>.
              </p>
            )}
            <Button type="submit" disabled={pending} className="mt-2">
              {pending ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta? <Link href="/login" className="underline">Inicia sesión</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

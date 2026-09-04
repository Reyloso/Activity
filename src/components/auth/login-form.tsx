"use client";

import { useActionState } from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { authenticate, type LoginState } from "@/server/actions/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: LoginState = { error: null };

export function LoginForm({ blocked }: { blocked: boolean }) {
  const [state, formAction, pending] = useActionState(authenticate, initialState);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <div className="flex items-center gap-2">
        <GraduationCap className="size-6" />
        <span className="text-xl font-semibold tracking-tight">Activity Milio</span>
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Inicia sesión</CardTitle>
          <CardDescription>Usa tu correo corporativo y contraseña.</CardDescription>
        </CardHeader>
        <CardContent>
          {blocked && (
            <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              Tu cuenta fue bloqueada. Contacta a un administrador.
            </p>
          )}
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Correo corporativo</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" disabled={pending} className="mt-2">
              {pending ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta? <Link href="/register" className="underline">Regístrate</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

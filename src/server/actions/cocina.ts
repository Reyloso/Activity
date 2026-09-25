"use server";

import { auth } from "@/lib/auth";
import { signCocinaSocketToken } from "@/lib/cocina-auth";

export async function getCocinaSocketToken() {
  const session = await auth();
  if (!session?.user.id) throw new Error("No autenticado");
  return signCocinaSocketToken({ sub: session.user.id, name: session.user.name ?? "Jugador" });
}

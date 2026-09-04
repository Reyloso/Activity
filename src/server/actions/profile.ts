"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type ChangePasswordState = { error: string | null; success: boolean };

export async function changeOwnPassword(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const session = await auth();
  if (!session?.user.id) throw new Error("No autenticado");

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Completa todos los campos.", success: false };
  }
  if (newPassword.length < 8) {
    return { error: "La nueva contraseña debe tener al menos 8 caracteres.", success: false };
  }
  if (newPassword !== confirmPassword) {
    return { error: "La confirmación no coincide con la nueva contraseña.", success: false };
  }

  const user = await db.user.findUniqueOrThrow({ where: { id: session.user.id } });
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "Tu contraseña actual no es correcta.", success: false };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.user.update({ where: { id: session.user.id }, data: { passwordHash } });

  return { error: null, success: true };
}

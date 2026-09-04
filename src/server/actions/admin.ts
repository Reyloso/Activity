"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") throw new Error("No autorizado");
  return session;
}

export async function createGroup(_prev: { error: string | null }, formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!name) return { error: "El nombre del grupo es obligatorio." };

  await db.group.create({ data: { name, description: description || null } });
  revalidatePath("/admin/groups");
  return { error: null };
}

export async function deleteGroup(groupId: string) {
  await requireAdmin();
  await db.group.delete({ where: { id: groupId } });
  revalidatePath("/admin/groups");
  revalidatePath("/admin/activities");
}

export async function setGroupMember(groupId: string, userId: string, isMember: boolean) {
  await requireAdmin();
  if (isMember) {
    await db.groupMember.upsert({
      where: { groupId_userId: { groupId, userId } },
      update: {},
      create: { groupId, userId },
    });
  } else {
    await db.groupMember.deleteMany({ where: { groupId, userId } });
  }
  revalidatePath(`/admin/groups/${groupId}`);
}

export async function publishActivity(slug: string, config: { title: string; description: string; coverColor: string }) {
  await requireAdmin();
  await db.activity.upsert({
    where: { slug },
    update: { published: true },
    create: { slug, published: true, ...config },
  });
  revalidatePath("/admin/activities");
}

export async function setActivityGroup(activityId: string, groupId: string, hasAccess: boolean) {
  await requireAdmin();
  if (hasAccess) {
    await db.activityGroup.upsert({
      where: { activityId_groupId: { activityId, groupId } },
      update: {},
      create: { activityId, groupId },
    });
  } else {
    await db.activityGroup.deleteMany({ where: { activityId, groupId } });
  }
  revalidatePath("/admin/activities");
}

export async function publishGame(slug: string, config: { title: string; description: string; coverColor: string }) {
  await requireAdmin();
  await db.game.upsert({
    where: { slug },
    update: { published: true },
    create: { slug, published: true, ...config },
  });
  revalidatePath("/admin/didacticas");
}

export async function setGameGroup(gameId: string, groupId: string, hasAccess: boolean) {
  await requireAdmin();
  if (hasAccess) {
    await db.gameGroup.upsert({
      where: { gameId_groupId: { gameId, groupId } },
      update: {},
      create: { gameId, groupId },
    });
  } else {
    await db.gameGroup.deleteMany({ where: { gameId, groupId } });
  }
  revalidatePath("/admin/didacticas");
}

export async function setUserRole(userId: string, role: "ADMIN" | "MEMBER") {
  const session = await requireAdmin();
  if (session!.user.id === userId && role !== "ADMIN") {
    throw new Error("No puedes quitarte tu propio rol de administrador.");
  }

  await db.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

export async function setUserBlocked(userId: string, isBlocked: boolean) {
  const session = await requireAdmin();
  if (session!.user.id === userId) {
    throw new Error("No puedes bloquear tu propia cuenta.");
  }

  await db.user.update({ where: { id: userId }, data: { isBlocked } });
  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  const session = await requireAdmin();
  if (session!.user.id === userId) {
    throw new Error("No puedes eliminar tu propia cuenta.");
  }

  await db.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}

export type ResetPasswordState = { error: string | null; success: boolean };

export async function resetUserPassword(
  userId: string,
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const session = await requireAdmin();
  if (session!.user.id === userId) {
    return { error: "Usa \"Mi perfil\" para cambiar tu propia contraseña.", success: false };
  }

  const newPassword = String(formData.get("newPassword") ?? "");
  if (newPassword.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres.", success: false };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.user.update({ where: { id: userId }, data: { passwordHash } });
  revalidatePath("/admin/users");

  return { error: null, success: true };
}

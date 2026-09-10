"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") throw new Error("No autorizado");
  return session;
}

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueActivitySlug(base: string) {
  const slugBase = slugify(base) || "actividad";
  let slug = slugBase;
  let suffix = 2;
  while (await db.activity.findUnique({ where: { slug } })) {
    slug = `${slugBase}-${suffix}`;
    suffix += 1;
  }
  return slug;
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

export type CreateActivityState = { error: string | null };

type OptionInput = { text: string; isCorrect: boolean };
type QuestionInput = { text: string; points: number; options: OptionInput[] };
type ActivityModuleInput = {
  title: string;
  content: string;
  imageUrl: string;
  videoUrl: string;
  passingScore: number;
  questions: QuestionInput[];
};

export async function createActivity(
  _prev: CreateActivityState,
  formData: FormData,
): Promise<CreateActivityState> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const coverColor = String(formData.get("coverColor") ?? "2F3C7E").replace(/^#/, "");
  const modulesRaw = String(formData.get("modules") ?? "[]");

  if (!title) return { error: "El título es obligatorio." };
  if (!description) return { error: "La descripción es obligatoria." };

  let modules: ActivityModuleInput[];
  try {
    modules = JSON.parse(modulesRaw);
  } catch {
    return { error: "Los módulos no tienen un formato válido." };
  }

  if (modules.length === 0) return { error: "Agrega al menos un módulo." };
  for (const m of modules) {
    if (!m.title.trim()) return { error: "Cada módulo necesita un título." };
    const hasContent = m.content.trim() || m.imageUrl.trim() || m.videoUrl.trim() || m.questions.length > 0;
    if (!hasContent) return { error: `El módulo "${m.title}" necesita contenido, imagen, video o preguntas.` };
    for (const q of m.questions) {
      if (!q.text.trim()) return { error: "Cada pregunta necesita un texto." };
      if (q.options.length < 2 || q.options.some((o) => !o.text.trim())) {
        return { error: "Cada pregunta necesita al menos 2 opciones con texto." };
      }
      if (q.options.filter((o) => o.isCorrect).length !== 1) {
        return { error: "Cada pregunta necesita exactamente una opción correcta." };
      }
      if (!Number.isFinite(q.points) || q.points < 0) {
        return { error: "El puntaje de cada pregunta debe ser un número válido." };
      }
    }
  }

  const slug = await uniqueActivitySlug(title);

  await db.activity.create({
    data: {
      slug,
      title,
      description,
      coverColor,
      published: true,
      modules: {
        create: modules.map((m, index) => ({
          title: m.title.trim(),
          content: m.content.trim() || null,
          imageUrl: m.imageUrl.trim() || null,
          videoUrl: m.videoUrl.trim() || null,
          passingScore: m.questions.some((q) => q.points > 0) ? Math.round(m.passingScore) || 70 : null,
          order: index,
          questions: {
            create: m.questions.map((q, qIndex) => ({
              text: q.text.trim(),
              points: Math.round(q.points),
              order: qIndex,
              options: {
                create: q.options.map((o, oIndex) => ({
                  text: o.text.trim(),
                  isCorrect: o.isCorrect,
                  order: oIndex,
                })),
              },
            })),
          },
        })),
      },
    },
  });

  revalidatePath("/admin/activities");
  redirect("/admin/activities");
}

export async function setActivityPublished(activityId: string, published: boolean) {
  await requireAdmin();
  await db.activity.update({ where: { id: activityId }, data: { published } });
  revalidatePath("/admin/activities");
}

export async function deleteActivity(activityId: string) {
  await requireAdmin();
  await db.activity.delete({ where: { id: activityId } });
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

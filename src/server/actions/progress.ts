"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function completeModule(activitySlug: string, moduleId: string, totalModules: number) {
  const session = await auth();
  if (!session?.user.id) throw new Error("No autenticado");
  const userId = session.user.id;

  await db.moduleProgress.upsert({
    where: { userId_activitySlug_moduleId: { userId, activitySlug, moduleId } },
    update: {},
    create: { userId, activitySlug, moduleId },
  });

  const completedCount = await db.moduleProgress.count({ where: { userId, activitySlug } });

  if (completedCount >= totalModules) {
    await db.enrollment.upsert({
      where: { userId_activitySlug: { userId, activitySlug } },
      update: { completedAt: new Date() },
      create: { userId, activitySlug, completedAt: new Date() },
    });
  }

  revalidatePath(`/activities/${activitySlug}`);
}

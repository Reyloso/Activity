import { db } from "@/lib/db";

export async function getActivityAccess(slug: string, userId: string, isAdmin: boolean) {
  const activity = await db.activity.findUnique({
    where: { slug },
    include: { groups: true },
  });
  if (!activity || !activity.published) return null;

  if (!isAdmin) {
    const membership = await db.groupMember.findMany({ where: { userId } });
    const userGroupIds = new Set(membership.map((m) => m.groupId));
    const hasAccess = activity.groups.some((g) => userGroupIds.has(g.groupId));
    if (!hasAccess) return null;
  }

  const progress = await db.moduleProgress.findMany({ where: { userId, activitySlug: slug } });
  return { activity, completedModuleIds: new Set(progress.map((p) => p.moduleId)) };
}

export async function getApprovedUsers(slug: string) {
  const enrollments = await db.enrollment.findMany({
    where: { activitySlug: slug, completedAt: { not: null } },
    include: { user: true },
    orderBy: { completedAt: "desc" },
  });
  return enrollments.map((e) => e.user);
}

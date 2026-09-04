import { db } from "@/lib/db";
import { activityRegistry } from "@/activities/registry";

export async function getVisibleActivities(userId: string, isAdmin: boolean) {
  const dbActivities = await db.activity.findMany({
    where: { published: true },
    include: { groups: { include: { group: true } } },
  });

  const userGroupIds = isAdmin
    ? null
    : new Set((await db.groupMember.findMany({ where: { userId } })).map((m) => m.groupId));

  const enrollments = await db.enrollment.findMany({ where: { userId } });
  const enrollmentBySlug = new Map(enrollments.map((e) => [e.activitySlug, e]));

  return dbActivities
    .filter((activity) => {
      if (isAdmin) return true;
      if (activity.groups.length === 0) return false;
      return activity.groups.some((g) => userGroupIds!.has(g.groupId));
    })
    .map((activity) => {
      const config = activityRegistry.find((a) => a.slug === activity.slug);
      const enrollment = enrollmentBySlug.get(activity.slug);
      return {
        ...activity,
        moduleCount: config?.modules.length ?? 0,
        completed: !!enrollment?.completedAt,
      };
    });
}

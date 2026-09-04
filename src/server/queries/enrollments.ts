import { db } from "@/lib/db";
import { getActivityConfig } from "@/activities/registry";

export async function getCompletedEnrollments(userId: string) {
  const enrollments = await db.enrollment.findMany({
    where: { userId, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
  });

  return enrollments
    .map((enrollment) => {
      const config = getActivityConfig(enrollment.activitySlug);
      if (!config) return null;
      return { ...enrollment, activityTitle: config.title };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);
}

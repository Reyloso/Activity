import { db } from "@/lib/db";
import { getResolvedActivityConfig } from "@/server/queries/activity-content";

export async function getCompletedEnrollments(userId: string) {
  const enrollments = await db.enrollment.findMany({
    where: { userId, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
  });

  const resolved = await Promise.all(
    enrollments.map(async (enrollment) => {
      const config = await getResolvedActivityConfig(enrollment.activitySlug);
      if (!config) return null;
      return { ...enrollment, activityTitle: config.title };
    }),
  );

  return resolved.filter((e): e is NonNullable<typeof e> => e !== null);
}

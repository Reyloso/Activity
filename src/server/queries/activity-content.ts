import { db } from "@/lib/db";
import { getActivityConfig } from "@/activities/registry";
import { TextModule } from "@/components/activities/text-module";
import type { ActivityConfig } from "@/activities/types";

export async function getResolvedActivityConfig(slug: string): Promise<ActivityConfig | null> {
  const codeConfig = getActivityConfig(slug);
  if (codeConfig) return codeConfig;

  const activity = await db.activity.findUnique({
    where: { slug },
    include: { modules: { orderBy: { order: "asc" } } },
  });
  if (!activity || activity.modules.length === 0) return null;

  return {
    slug: activity.slug,
    title: activity.title,
    description: activity.description,
    coverColor: activity.coverColor,
    modules: activity.modules.map((m) => ({
      id: m.id,
      title: m.title,
      type: "content" as const,
      Component: TextModule,
      content: m.content,
    })),
  };
}

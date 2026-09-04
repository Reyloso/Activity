import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActivityAccess, getApprovedUsers } from "@/server/queries/activity-detail";
import { getActivityConfig } from "@/activities/registry";
import { ModuleViewer } from "@/components/activities/module-viewer";
import { ApprovedAvatars } from "@/components/activities/approved-avatars";

export default async function ActivityDetailPage({ params }: PageProps<"/activities/[slug]">) {
  const { slug } = await params;
  const session = await auth();

  const access = await getActivityAccess(slug, session!.user.id!, session!.user.role === "ADMIN");
  const config = getActivityConfig(slug);
  if (!access || !config) notFound();

  const approvedUsers = await getApprovedUsers(slug);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
        <ApprovedAvatars users={approvedUsers} />
      </div>
      <ModuleViewer
        activitySlug={slug}
        modules={config.modules}
        initialCompletedIds={[...access.completedModuleIds]}
      />
    </div>
  );
}

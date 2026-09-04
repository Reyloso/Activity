import { auth } from "@/lib/auth";
import { getVisibleActivities } from "@/server/queries/activities";
import { ActivityCard } from "@/components/activities/activity-card";

export default async function ActivitiesPage() {
  const session = await auth();
  const activities = await getVisibleActivities(session!.user.id!, session!.user.role === "ADMIN");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Actividades</h1>
      {activities.length === 0 ? (
        <p className="text-muted-foreground">Todavía no tienes actividades asignadas.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.slug}
              slug={activity.slug}
              title={activity.title}
              description={activity.description}
              coverColor={activity.coverColor}
              moduleCount={activity.moduleCount}
              completed={activity.completed}
            />
          ))}
        </div>
      )}
    </div>
  );
}

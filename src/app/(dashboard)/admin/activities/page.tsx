import { db } from "@/lib/db";
import { activityRegistry } from "@/activities/registry";
import { PublishActivityButton } from "@/components/admin/publish-activity-button";
import { ActivityGroupToggle } from "@/components/admin/activity-group-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminActivitiesPage() {
  const groups = await db.group.findMany({ orderBy: { name: "asc" } });
  const dbActivities = await db.activity.findMany({ include: { groups: true } });
  const dbBySlug = new Map(dbActivities.map((a) => [a.slug, a]));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Actividades</h1>

      <div className="flex flex-col gap-4">
        {activityRegistry.map((config) => {
          const dbActivity = dbBySlug.get(config.slug);
          const grantedGroupIds = new Set(dbActivity?.groups.map((g) => g.groupId));

          return (
            <Card key={config.slug}>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{config.title}</CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </div>
                  {dbActivity?.published ? (
                    <Badge>Publicada</Badge>
                  ) : (
                    <PublishActivityButton
                      slug={config.slug}
                      title={config.title}
                      description={config.description}
                      coverColor={config.coverColor}
                    />
                  )}
                </div>
              </CardHeader>
              {dbActivity?.published && (
                <CardContent>
                  <p className="mb-2 text-sm font-medium">Grupos con acceso</p>
                  <div className="flex flex-wrap gap-2">
                    {groups.length === 0 && (
                      <p className="text-sm text-muted-foreground">Crea un grupo primero en la sección Grupos.</p>
                    )}
                    {groups.map((group) => (
                      <ActivityGroupToggle
                        key={group.id}
                        activityId={dbActivity.id}
                        groupId={group.id}
                        label={group.name}
                        initialChecked={grantedGroupIds.has(group.id)}
                      />
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { activityRegistry } from "@/activities/registry";
import { PublishActivityButton } from "@/components/admin/publish-activity-button";
import { ActivityGroupToggle } from "@/components/admin/activity-group-toggle";
import { ToggleActivityPublishedButton } from "@/components/admin/toggle-activity-published-button";
import { DeleteActivityButton } from "@/components/admin/delete-activity-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminActivitiesPage() {
  const groups = await db.group.findMany({ orderBy: { name: "asc" } });
  const dbActivities = await db.activity.findMany({ include: { groups: true, _count: { select: { modules: true } } } });
  const dbBySlug = new Map(dbActivities.map((a) => [a.slug, a]));
  const registrySlugs = new Set(activityRegistry.map((a) => a.slug));
  const customActivities = dbActivities.filter((a) => !registrySlugs.has(a.slug));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Actividades</h1>
        <Button render={<Link href="/admin/activities/nueva" />} nativeButton={false} className="gap-1.5">
          <Plus className="size-4" /> Crear actividad
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Actividades personalizadas</h2>
        {customActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no has creado ninguna actividad. Usa &quot;Crear actividad&quot; para empezar.
          </p>
        ) : (
          customActivities.map((activity) => {
            const grantedGroupIds = new Set(activity.groups.map((g) => g.groupId));
            return (
              <Card key={activity.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">{activity.title}</CardTitle>
                      <CardDescription>{activity.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <ToggleActivityPublishedButton activityId={activity.id} initialPublished={activity.published} />
                      <Button
                        render={<Link href={`/admin/activities/${activity.id}/editar`} />}
                        nativeButton={false}
                        size="sm"
                        variant="outline"
                      >
                        <Pencil className="size-4" /> Editar
                      </Button>
                      <DeleteActivityButton activityId={activity.id} activityTitle={activity.title} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Badge variant="secondary" className="w-fit">
                    {activity._count.modules} módulos
                  </Badge>
                  {activity.published && (
                    <div>
                      <p className="mb-2 text-sm font-medium">Grupos con acceso</p>
                      <div className="flex flex-wrap gap-2">
                        {groups.length === 0 && (
                          <p className="text-sm text-muted-foreground">Crea un grupo primero en la sección Grupos.</p>
                        )}
                        {groups.map((group) => (
                          <ActivityGroupToggle
                            key={group.id}
                            activityId={activity.id}
                            groupId={group.id}
                            label={group.name}
                            initialChecked={grantedGroupIds.has(group.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Actividades del código</h2>
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

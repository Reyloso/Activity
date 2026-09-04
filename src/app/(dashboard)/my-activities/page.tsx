import { Download, Trophy } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getActivityConfig } from "@/activities/registry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function MyActivitiesPage() {
  const session = await auth();
  const enrollments = await db.enrollment.findMany({
    where: { userId: session!.user.id!, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Mis actividades aprobadas</h1>

      {enrollments.length === 0 ? (
        <p className="text-muted-foreground">Aún no has completado ninguna actividad.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {enrollments.map((enrollment) => {
            const config = getActivityConfig(enrollment.activitySlug);
            if (!config) return null;
            return (
              <Card key={enrollment.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trophy className="size-5 text-amber-500" />
                    <CardTitle className="text-lg">{config.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">
                    Completada el{" "}
                    {enrollment.completedAt!.toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <Button
                    render={<a href={`/api/certificates/${enrollment.activitySlug}`} />}
                    nativeButton={false}
                    className="w-fit gap-2"
                  >
                    <Download className="size-4" /> Descargar certificado
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { Download } from "lucide-react";
import { auth } from "@/lib/auth";
import { getCompletedEnrollments } from "@/server/queries/enrollments";
import { CertificatePreview } from "@/components/certificates/certificate-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function MyActivitiesPage() {
  const session = await auth();
  const enrollments = await getCompletedEnrollments(session!.user.id!);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Mis actividades aprobadas</h1>

      {enrollments.length === 0 ? (
        <p className="text-muted-foreground">Aún no has completado ninguna actividad.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {enrollments.map((enrollment) => {
            const date = enrollment.completedAt!.toLocaleDateString("es-CO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            return (
              <Card key={enrollment.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{enrollment.activityTitle}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <CertificatePreview
                    fullName={session!.user.name!}
                    activityTitle={enrollment.activityTitle}
                    date={date}
                  />
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

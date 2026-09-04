import { auth } from "@/lib/auth";
import { getCompletedEnrollments } from "@/server/queries/enrollments";
import { MedalBadge } from "@/components/certificates/medal-badge";

export default async function LogrosPage() {
  const session = await auth();
  const enrollments = await getCompletedEnrollments(session!.user.id!);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis logros</h1>
        <p className="text-muted-foreground">Una medalla por cada actividad que has completado.</p>
      </div>

      {enrollments.length === 0 ? (
        <p className="text-muted-foreground">
          Todavía no tienes logros. ¡Completa una actividad para ganar tu primera medalla!
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {enrollments.map((enrollment, index) => (
            <MedalBadge
              key={enrollment.id}
              index={index}
              title={enrollment.activityTitle}
              date={enrollment.completedAt!.toLocaleDateString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

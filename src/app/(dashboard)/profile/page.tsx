import Link from "next/link";
import { KeyRound, Medal, ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { getCompletedEnrollments } from "@/server/queries/enrollments";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  MEMBER: "Miembro",
};

export default async function ProfilePage() {
  const session = await auth();
  const enrollments = await getCompletedEnrollments(session!.user.id!);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi perfil</h1>
        <p className="text-muted-foreground">Tu información y tu progreso en Activity Milio.</p>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between pt-6">
          <div>
            <p className="text-lg font-semibold">{session!.user.name}</p>
            <p className="text-sm text-muted-foreground">{session!.user.email}</p>
          </div>
          <Badge variant="secondary">{roleLabels[session!.user.role] ?? session!.user.role}</Badge>
        </CardContent>
      </Card>

      <Link href="/profile/logros" className="block">
        <Card className="transition-colors hover:bg-accent/50">
          <CardContent className="flex items-center justify-between pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-[#241654] to-[#9d174d]">
                <Medal className="size-5 text-white" />
              </div>
              <div>
                <p className="font-medium">Mis logros</p>
                <p className="text-sm text-muted-foreground">
                  {enrollments.length === 0
                    ? "Todavía no tienes medallas"
                    : `${enrollments.length} actividad${enrollments.length === 1 ? "" : "es"} completada${enrollments.length === 1 ? "" : "s"}`}
                </p>
              </div>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>

      <Link href="/profile/password" className="block">
        <Card className="transition-colors hover:bg-accent/50">
          <CardContent className="flex items-center justify-between pt-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <KeyRound className="size-5" />
              </div>
              <p className="font-medium">Cambiar contraseña</p>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

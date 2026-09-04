import { auth } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await auth();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi perfil</h1>
        <p className="text-muted-foreground">
          {session!.user.name} · {session!.user.email}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cambiar contraseña</CardTitle>
          <CardDescription>Necesitas tu contraseña actual para establecer una nueva.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}

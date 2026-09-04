import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChangePasswordPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cambiar contraseña</h1>
        <p className="text-muted-foreground">Necesitas tu contraseña actual para establecer una nueva.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nueva contraseña</CardTitle>
          <CardDescription>Debe tener al menos 8 caracteres.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}

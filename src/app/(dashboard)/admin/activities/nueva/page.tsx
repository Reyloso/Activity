import { CreateActivityForm } from "@/components/admin/create-activity-form";

export default function NewActivityPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Crear actividad</h1>
        <p className="text-muted-foreground">
          Se publicará de inmediato. Asigna los grupos con acceso desde la lista de actividades.
        </p>
      </div>
      <CreateActivityForm />
    </div>
  );
}

import { notFound } from "next/navigation";
import { getActivityForEdit } from "@/server/queries/activity-content";
import { CreateActivityForm, type ModuleDraft } from "@/components/admin/create-activity-form";

export default async function EditActivityPage({ params }: PageProps<"/admin/activities/[id]/editar">) {
  const { id } = await params;
  const activity = await getActivityForEdit(id);
  if (!activity) notFound();

  const initialModules: ModuleDraft[] = activity.modules.map((m) => ({
    title: m.title,
    content: m.content ?? "",
    videoUrl: m.videoUrl ?? "",
    passingScore: m.passingScore ?? 70,
    questions: m.questions.map((q) => ({
      text: q.text,
      points: q.points,
      options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
    })),
  }));

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar actividad</h1>
        <p className="text-muted-foreground">Los cambios se aplican de inmediato para todos los usuarios.</p>
      </div>
      <CreateActivityForm
        activityId={activity.id}
        initialTitle={activity.title}
        initialDescription={activity.description}
        initialCoverColor={activity.coverColor}
        initialModules={initialModules}
      />
    </div>
  );
}

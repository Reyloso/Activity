import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTriviaForEdit } from "@/server/queries/trivias";
import { CreateTriviaForm } from "@/components/trivias/create-trivia-form";

export default async function EditTriviaPage({ params }: PageProps<"/didacticas/trivias/[triviaId]/editar">) {
  const { triviaId } = await params;
  const session = await auth();
  if (!session?.user.id) redirect("/login");

  const trivia = await getTriviaForEdit(triviaId);
  if (!trivia) notFound();
  if (trivia.createdById !== session.user.id && session.user.role !== "ADMIN") {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar trivia</h1>
        <p className="text-muted-foreground">Los cambios se aplicarán a las próximas partidas que uses esta trivia.</p>
      </div>
      <CreateTriviaForm
        triviaId={trivia.id}
        initialTitle={trivia.title}
        initialDescription={trivia.description ?? ""}
        initialShuffleQuestions={trivia.shuffleQuestions}
        initialUsePoints={trivia.usePoints}
        initialQuestions={trivia.questions.map((q) => ({
          text: q.text,
          options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect, points: o.points })),
        }))}
      />
    </div>
  );
}

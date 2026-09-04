import { CreateTriviaForm } from "@/components/trivias/create-trivia-form";

export default function NewTriviaPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Crear trivia</h1>
        <p className="text-muted-foreground">
          Será visible para todos, pero solo tú (y los administradores) pueden ver cuál es la respuesta correcta.
        </p>
      </div>
      <CreateTriviaForm />
    </div>
  );
}

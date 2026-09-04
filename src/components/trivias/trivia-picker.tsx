import { CheckCircle2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type AvailableTrivia = { id: string; title: string; questionCount: number };

export function TriviaPicker({
  trivias,
  selectedTriviaTitle,
  onSelect,
}: {
  trivias: AvailableTrivia[];
  selectedTriviaTitle: string;
  onSelect: (triviaId: string) => void;
}) {
  if (trivias.length === 0) {
    return <p className="text-white/80">Todavía no hay trivias creadas para elegir.</p>;
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <p className="text-center text-sm font-medium uppercase tracking-wide text-white/70">
        {selectedTriviaTitle ? "Cambiar trivia" : "Elige una trivia"}
      </p>
      {trivias.map((trivia) => {
        const isSelected = trivia.title === selectedTriviaTitle;
        return (
          <button
            key={trivia.id}
            type="button"
            onClick={() => onSelect(trivia.id)}
            className={cn(
              "flex items-center justify-between gap-2 rounded-lg bg-white/10 px-4 py-3 text-left text-white transition-colors hover:bg-white/20",
              isSelected && "ring-2 ring-white",
            )}
          >
            <span className="flex items-center gap-2 font-medium">
              {isSelected ? <CheckCircle2 className="size-4 shrink-0" /> : <HelpCircle className="size-4 shrink-0" />}
              {trivia.title}
            </span>
            <span className="text-sm text-white/70">{trivia.questionCount} preguntas</span>
          </button>
        );
      })}
    </div>
  );
}

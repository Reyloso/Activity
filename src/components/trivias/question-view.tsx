import { CheckCircle2 } from "lucide-react";
import { OPTION_BG, OPTION_ICONS } from "@/components/trivias/option-shape";
import { cn } from "@/lib/utils";
import type { PublicQuestion } from "@/lib/trivia-events";

export function QuestionView({
  question,
  timeLeftMs,
  selectedOptionId,
  answeredCount,
  totalPlayers,
  onAnswer,
}: {
  question: PublicQuestion;
  timeLeftMs: number;
  selectedOptionId: string | null;
  answeredCount: number;
  totalPlayers: number;
  onAnswer: (optionId: string) => void;
}) {
  const progress = Math.max(0, Math.min(1, timeLeftMs / question.durationMs));

  return (
    <div className="flex w-full flex-col gap-6 text-white">
      <div className="flex items-center justify-between text-sm text-white/80">
        <span>
          Pregunta {question.index + 1} / {question.total}
        </span>
        <span>
          {answeredCount} / {totalPlayers} respondieron
        </span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-white transition-[width] duration-100 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <h2 className="animate-trivia-slide text-center text-2xl font-bold sm:text-3xl">{question.text}</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {question.options.map((option, i) => {
          const Icon = OPTION_ICONS[option.color];
          const isSelected = selectedOptionId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={!!selectedOptionId}
              onClick={() => onAnswer(option.id)}
              style={{ animationDelay: `${i * 60}ms` }}
              className={cn(
                "animate-trivia-pop flex items-center gap-3 rounded-xl border-b-4 p-5 text-left text-lg font-semibold text-white shadow-lg transition-transform disabled:cursor-not-allowed",
                OPTION_BG[option.color],
                isSelected ? "scale-95 ring-4 ring-white" : "enabled:hover:scale-[1.02]",
                selectedOptionId && !isSelected && "opacity-50",
              )}
            >
              <Icon className="size-6 shrink-0 fill-current" />
              <span>{option.text}</span>
              {isSelected && <CheckCircle2 className="ml-auto size-6 shrink-0" />}
            </button>
          );
        })}
      </div>

      {selectedOptionId && <p className="text-center text-white/80">Respuesta enviada, esperando...</p>}
    </div>
  );
}

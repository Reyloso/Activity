import { CheckCircle2, TrendingUp, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OPTION_BG, OPTION_ICONS } from "@/components/trivias/option-shape";
import { cn } from "@/lib/utils";
import type { MyResultPayload, PublicQuestion, SummaryPayload } from "@/lib/trivia-events";

export function AnswerSummaryView({
  question,
  summary,
  myResult,
  isHost,
  onShowRanking,
}: {
  question: PublicQuestion;
  summary: SummaryPayload;
  myResult: MyResultPayload | null;
  isHost: boolean;
  onShowRanking: () => void;
}) {
  const maxCount = Math.max(1, ...Object.values(summary.optionCounts));
  const totalAnswers = Object.values(summary.optionCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex w-full flex-col items-center gap-6 text-white">
      {myResult && (
        <div
          className={cn(
            "animate-trivia-pop flex items-center gap-2 rounded-xl px-6 py-3 text-xl font-bold",
            myResult.correct ? "bg-emerald-500" : "bg-red-500",
          )}
        >
          {myResult.correct ? <CheckCircle2 className="size-6" /> : <XCircle className="size-6" />}
          {myResult.correct ? `¡Correcto! +${myResult.gained} puntos` : "Respuesta incorrecta"}
        </div>
      )}

      <div className="flex items-center gap-2 text-white/70">
        <TrendingUp className="size-4" />
        <span className="text-sm">{totalAnswers} respuestas en total</span>
      </div>

      <div className="flex w-full flex-col gap-3">
        {question.options.map((option) => {
          const Icon = OPTION_ICONS[option.color];
          const count = summary.optionCounts[option.id] ?? 0;
          const isCorrect = option.id === summary.correctOptionId;
          return (
            <div key={option.id} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-12 items-center gap-2 rounded-lg border-b-4 px-3 text-sm font-semibold text-white",
                  OPTION_BG[option.color],
                  isCorrect && "ring-2 ring-white",
                )}
                style={{ width: `${Math.max(12, (count / maxCount) * 100)}%` }}
              >
                <Icon className="size-4 shrink-0 fill-current" />
                <span className="truncate">{option.text}</span>
              </div>
              <span className="w-6 text-right font-bold">{count}</span>
              {isCorrect && <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />}
            </div>
          );
        })}
      </div>

      {isHost ? (
        <Button size="lg" onClick={onShowRanking} className="bg-white text-violet-700 hover:bg-white/90">
          Ver ranking
        </Button>
      ) : (
        <p className="text-white/80">Esperando el ranking...</p>
      )}
    </div>
  );
}

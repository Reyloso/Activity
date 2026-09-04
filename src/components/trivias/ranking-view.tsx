import { ArrowRight, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RankingEntry } from "@/lib/trivia-events";

const medalColors = ["text-amber-300", "text-slate-200", "text-orange-400"];

export function RankingView({
  ranking,
  isHost,
  isLastQuestion,
  onNext,
}: {
  ranking: RankingEntry[];
  isHost: boolean;
  isLastQuestion: boolean;
  onNext: () => void;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-6 text-white">
      <div className="w-full max-w-md rounded-2xl bg-white/10 p-4 backdrop-blur">
        <p className="mb-3 text-center text-sm font-semibold uppercase tracking-wide text-white/70">Ranking</p>
        <div className="flex flex-col gap-2">
          {ranking.map((entry, i) => (
            <div
              key={entry.userId}
              style={{ animationDelay: `${i * 70}ms` }}
              className="animate-trivia-slide flex items-center justify-between rounded-lg bg-white/10 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                {i < 3 ? (
                  <Medal className={medalColors[i]} />
                ) : (
                  <span className="w-5 text-center text-sm text-white/60">{i + 1}</span>
                )}
                <span className="font-medium">{entry.name}</span>
              </div>
              <span className="font-bold">{entry.score}</span>
            </div>
          ))}
        </div>
      </div>

      {isHost && (
        <Button size="lg" onClick={onNext} className="gap-2 bg-white text-violet-700 hover:bg-white/90">
          {isLastQuestion ? "Ver resultados finales" : "Siguiente pregunta"} <ArrowRight className="size-5" />
        </Button>
      )}
    </div>
  );
}

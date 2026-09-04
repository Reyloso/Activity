"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RankingEntry } from "@/lib/trivia-events";

export function FinalPodium({
  ranking,
  isHost,
  onReturnToLobby,
  onLeave,
}: {
  ranking: RankingEntry[];
  isHost: boolean;
  onReturnToLobby: () => void;
  onLeave: () => void;
}) {
  useEffect(() => {
    if (ranking.length === 0) return;
    const duration = 2000;
    const end = Date.now() + duration;
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors: ["#facc15", "#f472b6", "#a78bfa", "#34d399"] });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors: ["#facc15", "#f472b6", "#a78bfa", "#34d399"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [ranking.length]);

  const podium = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div className="flex w-full flex-col items-center gap-8 text-white">
      <h2 className="text-3xl font-black">¡Partida terminada!</h2>

      <div className="flex items-end gap-4">
        {podium[1] && <PodiumBlock entry={podium[1]} place={2} height="h-24" />}
        {podium[0] && <PodiumBlock entry={podium[0]} place={1} height="h-32" />}
        {podium[2] && <PodiumBlock entry={podium[2]} place={3} height="h-16" />}
      </div>

      {rest.length > 0 && (
        <div className="w-full max-w-md rounded-2xl bg-white/10 p-4 backdrop-blur">
          <div className="flex flex-col gap-2">
            {rest.map((entry, i) => (
              <div key={entry.userId} className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2">
                <span className="font-medium">
                  {i + 4}. {entry.name}
                </span>
                <span className="font-bold">{entry.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        {isHost ? (
          <Button size="lg" onClick={onReturnToLobby} className="gap-2 bg-white text-violet-700 hover:bg-white/90">
            <RotateCcw className="size-5" /> Jugar otra trivia
          </Button>
        ) : (
          <p className="text-white/80">Esperando a que el anfitrión elija la siguiente trivia...</p>
        )}
        <Button size="sm" variant="ghost" onClick={onLeave} className="text-white/70 hover:text-white">
          Salir de la sala
        </Button>
      </div>
    </div>
  );
}

function PodiumBlock({ entry, place, height }: { entry: RankingEntry; place: number; height: string }) {
  return (
    <div className="animate-trivia-pop flex flex-col items-center gap-2">
      {place === 1 && <Trophy className="size-8 text-amber-300" />}
      <span className="max-w-24 truncate font-semibold">{entry.name}</span>
      <span className="text-sm text-white/80">{entry.score} pts</span>
      <div className={`flex w-20 ${height} items-start justify-center rounded-t-lg bg-white/20 pt-2 text-2xl font-black`}>
        {place}
      </div>
    </div>
  );
}

"use client";

import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { teamIdsFor, teamLabel, type TeamId, type TeamScores } from "@/lib/cocina-events";

export function FinalResults({
  scores,
  numTeams,
  winner,
  isHost,
  onReturnToLobby,
  onRestartMatch,
  onLeave,
}: {
  scores: TeamScores;
  numTeams: number;
  winner: TeamId | "empate";
  isHost: boolean;
  onReturnToLobby: () => void;
  onRestartMatch: () => void;
  onLeave: () => void;
}) {
  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-6 rounded-2xl bg-white/10 p-6 text-center text-white backdrop-blur-sm">
      <Trophy className="size-12 text-amber-300" />
      <h2 className="text-2xl font-bold">
        {winner === "empate" ? "¡Empate!" : `¡${teamLabel(winner)} gana!`}
      </h2>
      <div className="flex flex-wrap justify-center gap-8">
        {teamIdsFor(numTeams).map((team) => (
          <div key={team} className={team === winner ? "text-amber-300" : ""}>
            <p className="text-sm text-white/70">{teamLabel(team)}</p>
            <p className="text-3xl font-bold">{scores[team] ?? 0}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={onLeave}>
          Salir
        </Button>
        {isHost && (
          <>
            <Button type="button" onClick={onRestartMatch} className="bg-white text-violet-700 hover:bg-white/90">
              Reiniciar partida
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onReturnToLobby}
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              Volver al lobby
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

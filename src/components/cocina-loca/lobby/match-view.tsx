"use client";

import { NetworkedKitchenScene } from "@/components/cocina-loca/networked-kitchen-scene";
import { teamIdsFor, teamLabel, type TeamId, type TeamScores } from "@/lib/cocina-events";

export function MatchView({
  code,
  myUserId,
  myTeam,
  scores,
  numTeams,
  timeLeftMs,
}: {
  code: string;
  myUserId: string;
  myTeam: TeamId | null;
  scores: TeamScores;
  numTeams: number;
  timeLeftMs: number;
}) {
  const minutes = Math.floor(timeLeftMs / 60_000);
  const seconds = Math.floor((timeLeftMs % 60_000) / 1000);

  return (
    <div className="flex w-full max-w-4xl flex-col gap-4 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
        <div className="flex flex-wrap gap-6">
          {teamIdsFor(numTeams).map((team) => (
            <div key={team} className={team === myTeam ? "text-center text-amber-300" : "text-center"}>
              <p className="text-xs text-white/70">{teamLabel(team)}</p>
              <p className="text-2xl font-bold">{scores[team] ?? 0}</p>
            </div>
          ))}
        </div>
        <p className={`font-mono text-2xl font-bold ${timeLeftMs <= 30_000 ? "text-red-300" : ""}`}>
          {minutes}:{seconds.toString().padStart(2, "0")}
        </p>
      </div>
      <NetworkedKitchenScene code={code} myUserId={myUserId} score={myTeam ? (scores[myTeam] ?? 0) : 0} />
    </div>
  );
}

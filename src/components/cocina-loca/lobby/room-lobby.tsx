"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  MAX_TEAM_SIZE,
  MAX_TEAMS,
  MIN_TEAM_SIZE,
  MIN_TEAMS,
  PLAYER_COLORS,
  teamIdsFor,
  teamLabel,
  type PlayerSummary,
  type RoomConfig,
  type TeamId,
} from "@/lib/cocina-events";

export function RoomLobby({
  code,
  players,
  config,
  myUserId,
  isHost,
  onSetConfig,
  onSetTeam,
  onSetColor,
  onStart,
  onLeave,
}: {
  code: string;
  players: PlayerSummary[];
  config: RoomConfig;
  myUserId: string;
  isHost: boolean;
  onSetConfig: (numTeams: number, teamSize: number) => void;
  onSetTeam: (team: TeamId) => void;
  onSetColor: (colorId: string) => void;
  onStart: () => void;
  onLeave: () => void;
}) {
  const me = players.find((p) => p.userId === myUserId);
  const teams = teamIdsFor(config.numTeams);
  const takenColorsInMyTeam = new Set(
    players.filter((p) => p.userId !== myUserId && p.team === me?.team).map((p) => p.colorId),
  );

  return (
    <div className="flex w-full max-w-lg flex-col gap-6 rounded-2xl bg-white/10 p-6 text-white backdrop-blur-sm">
      <div className="text-center">
        <p className="text-sm text-white/70">Código de la sala</p>
        <p className="font-mono text-4xl font-bold tracking-[0.3em]">{code}</p>
      </div>

      {isHost && (
        <div className="flex flex-col gap-3 rounded-lg bg-white/5 p-3">
          <p className="text-sm font-medium text-white/80">Configuración (solo el anfitrión)</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Número de equipos
              <select
                value={config.numTeams}
                onChange={(e) => onSetConfig(Number(e.target.value), config.teamSize)}
                className="rounded-md border border-white/20 bg-white/10 px-2 py-1.5 text-white [color-scheme:dark]"
              >
                {Array.from({ length: MAX_TEAMS - MIN_TEAMS + 1 }, (_, i) => MIN_TEAMS + i).map((n) => (
                  <option key={n} value={n} className="text-black">
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Jugadores por equipo
              <select
                value={config.teamSize}
                onChange={(e) => onSetConfig(config.numTeams, Number(e.target.value))}
                className="rounded-md border border-white/20 bg-white/10 px-2 py-1.5 text-white [color-scheme:dark]"
              >
                {Array.from({ length: MAX_TEAM_SIZE - MIN_TEAM_SIZE + 1 }, (_, i) => MIN_TEAM_SIZE + i).map((n) => (
                  <option key={n} value={n} className="text-black">
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-white/80">Elige tu equipo</p>
        <div className={cn("grid gap-2", teams.length > 3 ? "grid-cols-3" : "grid-cols-2")}>
          {teams.map((team) => {
            const count = players.filter((p) => p.team === team).length;
            const full = count >= config.teamSize && me?.team !== team;
            return (
              <Button
                key={team}
                type="button"
                disabled={full}
                variant={me?.team === team ? "default" : "outline"}
                className={cn(
                  me?.team === team ? "bg-white text-violet-700 hover:bg-white/90" : "text-foreground",
                )}
                onClick={() => onSetTeam(team)}
              >
                {teamLabel(team)} ({count}/{config.teamSize})
              </Button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-white/80">Elige tu color</p>
        <div className="grid grid-cols-4 gap-2">
          {PLAYER_COLORS.map((color) => {
            const taken = takenColorsInMyTeam.has(color.id);
            const selected = me?.colorId === color.id;
            return (
              <button
                key={color.id}
                type="button"
                disabled={taken}
                onClick={() => onSetColor(color.id)}
                title={color.label}
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-2 transition-transform",
                  selected ? "scale-110 border-white" : "border-transparent",
                  taken && !selected && "cursor-not-allowed opacity-30",
                )}
                style={{ backgroundColor: color.hex }}
              />
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-white/80">Jugadores ({players.length})</p>
        <div className="flex flex-col gap-1">
          {teams.map((team) => (
            <div key={team} className="flex flex-wrap items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
              <span className="text-xs font-semibold text-white/60">{teamLabel(team)}:</span>
              {players.filter((p) => p.team === team).length === 0 && (
                <span className="text-xs text-white/40">nadie todavía</span>
              )}
              {players
                .filter((p) => p.team === team)
                .map((p) => {
                  const color = PLAYER_COLORS.find((c) => c.id === p.colorId);
                  return (
                    <span key={p.userId} className="flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-1 text-sm">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: color?.hex ?? "#9ca3af" }}
                      />
                      {p.name}
                      {p.userId === myUserId && " (tú)"}
                    </span>
                  );
                })}
            </div>
          ))}
          {players.filter((p) => !p.team).length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
              <span className="text-xs font-semibold text-white/60">Sin equipo:</span>
              {players
                .filter((p) => !p.team)
                .map((p) => (
                  <span key={p.userId} className="text-sm text-white/70">
                    {p.name}
                    {p.userId === myUserId && " (tú)"}
                  </span>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={onLeave}>
          Salir
        </Button>
        {isHost && (
          <Button type="button" onClick={onStart} className="bg-white text-violet-700 hover:bg-white/90">
            Iniciar partida
          </Button>
        )}
      </div>
    </div>
  );
}

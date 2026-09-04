import { Crown, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlayerSummary } from "@/lib/trivia-events";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function RoomLobby({
  code,
  triviaTitle,
  players,
  isHost,
  onStart,
  onLeave,
}: {
  code: string;
  triviaTitle: string;
  players: PlayerSummary[];
  isHost: boolean;
  onStart: () => void;
  onLeave: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-8 text-center text-white">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-white/70">Código de sala</p>
        <p className="text-6xl font-black tracking-[0.2em] drop-shadow-lg">{code}</p>
      </div>
      <p className="text-xl font-semibold">{triviaTitle}</p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {players.length === 0 && (
          <p className="flex items-center gap-2 text-white/70">
            <Users className="size-5" /> Esperando jugadores...
          </p>
        )}
        {players.map((player, i) => (
          <div
            key={player.userId}
            style={{ animationDelay: `${i * 60}ms` }}
            className="animate-trivia-pop flex flex-col items-center gap-1"
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-white/20 text-lg font-bold backdrop-blur">
              {initials(player.name)}
            </div>
            <span className="max-w-20 truncate text-xs text-white/80">{player.name}</span>
          </div>
        ))}
      </div>

      <p className="text-sm text-white/70">{players.length} / 15 jugadores conectados</p>

      {isHost ? (
        <Button
          size="lg"
          disabled={players.length === 0}
          onClick={onStart}
          className="gap-2 bg-white text-violet-700 hover:bg-white/90"
        >
          <Crown className="size-5" /> Iniciar juego
        </Button>
      ) : (
        <p className="text-white/80">Esperando a que el anfitrión inicie la partida...</p>
      )}

      <Button size="sm" variant="ghost" onClick={onLeave} className="gap-1.5 text-white/70 hover:text-white">
        <LogOut className="size-4" /> Salir
      </Button>
    </div>
  );
}

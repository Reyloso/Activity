"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getConnectedCocinaSocket } from "@/lib/cocina-socket-client";
import { RoomLobby } from "@/components/cocina-loca/lobby/room-lobby";
import { MatchView } from "@/components/cocina-loca/lobby/match-view";
import { FinalResults } from "@/components/cocina-loca/lobby/final-results";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_NUM_TEAMS,
  DEFAULT_TEAM_SIZE,
  PLAYER_COLORS,
  type PlayerSummary,
  type RoomConfig,
  type TeamId,
  type TeamScores,
} from "@/lib/cocina-events";

type Phase = "connecting" | "lobby" | "playing" | "finished" | "lost";

export function CocinaLocaRoom({ code, isHost, myUserId }: { code: string; isHost: boolean; myUserId: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(() => (getConnectedCocinaSocket() ? "connecting" : "lost"));
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [config, setConfig] = useState<RoomConfig>({ numTeams: DEFAULT_NUM_TEAMS, teamSize: DEFAULT_TEAM_SIZE });
  const [scores, setScores] = useState<TeamScores>({});
  const [matchEndsAt, setMatchEndsAt] = useState<number | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const [winner, setWinner] = useState<TeamId | "empate">("empate");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const socket = getConnectedCocinaSocket();
    if (!socket) return;

    const onPlayersUpdate = (payload: { players: PlayerSummary[]; config: RoomConfig }) => {
      setPlayers(payload.players);
      setConfig(payload.config);
      setPhase((p) => (p === "connecting" ? "lobby" : p));
    };
    const onStarted = (payload: { matchEndsAt: number; scores: TeamScores }) => {
      setScores(payload.scores);
      setMatchEndsAt(payload.matchEndsAt);
      setPhase("playing");
    };
    const onScores = (payload: { scores: TeamScores }) => setScores(payload.scores);
    const onFinished = (payload: { scores: TeamScores; winner: TeamId | "empate" }) => {
      setScores(payload.scores);
      setWinner(payload.winner);
      setPhase("finished");
    };
    const onReturnedToLobby = () => {
      setScores({});
      setMatchEndsAt(null);
      setPhase("lobby");
    };
    const onError = (payload: { message: string }) => setErrorMsg(payload.message);
    const onClosed = () => setPhase("lost");

    socket.on("room:playersUpdate", onPlayersUpdate);
    socket.on("room:started", onStarted);
    socket.on("room:scores", onScores);
    socket.on("room:finished", onFinished);
    socket.on("room:returnedToLobby", onReturnedToLobby);
    socket.on("room:error", onError);
    socket.on("room:closed", onClosed);

    socket.emit("room:sync", { code });

    return () => {
      socket.off("room:playersUpdate", onPlayersUpdate);
      socket.off("room:started", onStarted);
      socket.off("room:scores", onScores);
      socket.off("room:finished", onFinished);
      socket.off("room:returnedToLobby", onReturnedToLobby);
      socket.off("room:error", onError);
      socket.off("room:closed", onClosed);
    };
  }, [code]);

  useEffect(() => {
    if (phase !== "playing" || !matchEndsAt) return;
    const tick = () => setTimeLeftMs(Math.max(0, matchEndsAt - Date.now()));
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [phase, matchEndsAt]);

  function handleSetConfig(numTeams: number, teamSize: number) {
    getConnectedCocinaSocket()?.emit("room:setConfig", { code, numTeams, teamSize });
  }

  function handleSetTeam(team: TeamId) {
    getConnectedCocinaSocket()?.emit("room:setTeam", { code, team });
  }

  function handleSetColor(colorId: string) {
    getConnectedCocinaSocket()?.emit("room:setColor", { code, colorId });
  }

  function handleStart() {
    getConnectedCocinaSocket()?.emit("room:start", { code });
  }

  function handleDeliver(points: number) {
    getConnectedCocinaSocket()?.emit("room:deliver", { code, points });
  }

  function handleReturnToLobby() {
    getConnectedCocinaSocket()?.emit("room:returnToLobby", { code });
  }

  function handleLeave() {
    getConnectedCocinaSocket()?.emit("room:leave", { code });
    router.push("/didacticas/cocina-loca");
  }

  if (phase === "lost") {
    return (
      <div className="flex flex-col items-center gap-4 text-center text-white">
        <p className="text-xl font-semibold">Perdiste la conexión con la sala.</p>
        <p className="text-white/80">
          Vuelve a Cocina Loca y únete de nuevo con el código <span className="font-mono font-bold">{code}</span>.
        </p>
        <Button
          render={<Link href="/didacticas/cocina-loca" />}
          nativeButton={false}
          className="bg-white text-violet-700 hover:bg-white/90"
        >
          Volver a Cocina Loca
        </Button>
      </div>
    );
  }

  const me = players.find((p) => p.userId === myUserId);
  const myColorHex = PLAYER_COLORS.find((c) => c.id === me?.colorId)?.hex ?? "#ef4444";

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {errorMsg && <p className="rounded-lg bg-white/20 px-4 py-2 text-sm text-white">{errorMsg}</p>}

      {phase === "connecting" && <p className="text-white/80">Conectando...</p>}

      {phase === "lobby" && (
        <RoomLobby
          code={code}
          players={players}
          config={config}
          myUserId={myUserId}
          isHost={isHost}
          onSetConfig={handleSetConfig}
          onSetTeam={handleSetTeam}
          onSetColor={handleSetColor}
          onStart={handleStart}
          onLeave={handleLeave}
        />
      )}

      {phase === "playing" && (
        <MatchView
          scores={scores}
          numTeams={config.numTeams}
          timeLeftMs={timeLeftMs}
          myColorHex={myColorHex}
          onDeliver={handleDeliver}
        />
      )}

      {phase === "finished" && (
        <FinalResults
          scores={scores}
          numTeams={config.numTeams}
          winner={winner}
          isHost={isHost}
          onReturnToLobby={handleReturnToLobby}
          onLeave={handleLeave}
        />
      )}
    </div>
  );
}

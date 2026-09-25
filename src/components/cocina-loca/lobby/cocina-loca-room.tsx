"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCocinaSocketToken } from "@/server/actions/cocina";
import { emitWithTimeout, getCocinaSocket, getConnectedCocinaSocket } from "@/lib/cocina-socket-client";
import { RoomLobby } from "@/components/cocina-loca/lobby/room-lobby";
import { MatchView } from "@/components/cocina-loca/lobby/match-view";
import { FinalResults } from "@/components/cocina-loca/lobby/final-results";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_ENABLED_RECIPE_IDS,
  DEFAULT_NUM_TEAMS,
  DEFAULT_TEAM_SIZE,
  type PlayerSummary,
  type RoomConfig,
  type TeamId,
  type TeamScores,
} from "@/lib/cocina-events";

type Phase = "connecting" | "lobby" | "playing" | "finished" | "lost";

export function CocinaLocaRoom({ code, isHost, myUserId }: { code: string; isHost: boolean; myUserId: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("connecting");
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [config, setConfig] = useState<RoomConfig>({
    numTeams: DEFAULT_NUM_TEAMS,
    teamSize: DEFAULT_TEAM_SIZE,
    enabledRecipeIds: DEFAULT_ENABLED_RECIPE_IDS,
  });
  const [scores, setScores] = useState<TeamScores>({});
  const [matchEndsAt, setMatchEndsAt] = useState<number | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const [winner, setWinner] = useState<TeamId | "empate">("empate");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lostReason, setLostReason] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let cleanupListeners: (() => void) | undefined;

    async function ensureConnected() {
      const existing = getConnectedCocinaSocket();
      if (existing) return existing;

      try {
        const token = await getCocinaSocketToken();
        if (cancelled) return null;
        const socket = getCocinaSocket(token);
        const res = await emitWithTimeout<{ ok: true } | { error: string }>(socket, "room:join", { code });
        if (cancelled) return null;
        // Un anfitrión que reabre su propia sala recibe este error puntual: no es fatal, ya está adentro.
        if ("error" in res && res.error !== "Eres el anfitrión de esta sala.") {
          setLostReason(res.error);
          setPhase("lost");
          return null;
        }
        return socket;
      } catch (err) {
        if (!cancelled) {
          setLostReason(err instanceof Error ? err.message : "No se pudo conectar con la sala.");
          setPhase("lost");
        }
        return null;
      }
    }

    ensureConnected().then((socket) => {
      if (cancelled || !socket) return;

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
      const onClosed = () => {
        setLostReason(null);
        setPhase("lost");
      };

      socket.on("room:playersUpdate", onPlayersUpdate);
      socket.on("room:started", onStarted);
      socket.on("room:scores", onScores);
      socket.on("room:finished", onFinished);
      socket.on("room:returnedToLobby", onReturnedToLobby);
      socket.on("room:error", onError);
      socket.on("room:closed", onClosed);

      socket.emit("room:sync", { code });

      cleanupListeners = () => {
        socket.off("room:playersUpdate", onPlayersUpdate);
        socket.off("room:started", onStarted);
        socket.off("room:scores", onScores);
        socket.off("room:finished", onFinished);
        socket.off("room:returnedToLobby", onReturnedToLobby);
        socket.off("room:error", onError);
        socket.off("room:closed", onClosed);
      };
    });

    return () => {
      cancelled = true;
      cleanupListeners?.();
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

  function handleSetRecipes(recipeIds: string[]) {
    getConnectedCocinaSocket()?.emit("room:setRecipes", { code, recipeIds });
  }

  function handleSetTeam(team: TeamId) {
    getConnectedCocinaSocket()?.emit("room:setTeam", { code, team });
  }

  function handleStart() {
    getConnectedCocinaSocket()?.emit("room:start", { code });
  }

  function handleRestartMatch() {
    getConnectedCocinaSocket()?.emit("room:restartMatch", { code });
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
        <p className="text-xl font-semibold">{lostReason ?? "Perdiste la conexión con la sala."}</p>
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
          onSetRecipes={handleSetRecipes}
          onSetTeam={handleSetTeam}
          onStart={handleStart}
          onLeave={handleLeave}
        />
      )}

      {phase === "playing" && (
        <MatchView
          code={code}
          myUserId={myUserId}
          myTeam={me?.team ?? null}
          scores={scores}
          numTeams={config.numTeams}
          timeLeftMs={timeLeftMs}
          isHost={isHost}
          onRestartMatch={handleRestartMatch}
        />
      )}

      {phase === "finished" && (
        <FinalResults
          scores={scores}
          numTeams={config.numTeams}
          winner={winner}
          isHost={isHost}
          onReturnToLobby={handleReturnToLobby}
          onRestartMatch={handleRestartMatch}
          onLeave={handleLeave}
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getConnectedTriviaSocket } from "@/lib/trivia-socket-client";
import { RoomLobby } from "@/components/trivias/room-lobby";
import { QuestionView } from "@/components/trivias/question-view";
import { AnswerSummaryView } from "@/components/trivias/answer-summary-view";
import { RankingView } from "@/components/trivias/ranking-view";
import { FinalPodium } from "@/components/trivias/final-podium";
import { Button } from "@/components/ui/button";
import type { AvailableTrivia } from "@/components/trivias/trivia-picker";
import type {
  MyResultPayload,
  PlayerSummary,
  PublicQuestion,
  RankingEntry,
  SummaryPayload,
} from "@/lib/trivia-events";

type Phase = "connecting" | "lobby" | "question" | "summary" | "ranking" | "finished" | "lost";

export function TriviaRoom({
  code,
  isHost,
  availableTrivias,
}: {
  code: string;
  isHost: boolean;
  availableTrivias: AvailableTrivia[];
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(() => (getConnectedTriviaSocket() ? "connecting" : "lost"));
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [triviaTitle, setTriviaTitle] = useState("");
  const [question, setQuestion] = useState<PublicQuestion | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [summary, setSummary] = useState<SummaryPayload | null>(null);
  const [myResult, setMyResult] = useState<MyResultPayload | null>(null);
  const [ranking, setRanking] = useState<RankingEntry[] | null>(null);
  const [finalRanking, setFinalRanking] = useState<RankingEntry[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const socket = getConnectedTriviaSocket();
    if (!socket) return;

    const onPlayersUpdate = (payload: { players: PlayerSummary[]; triviaTitle: string }) => {
      setPlayers(payload.players);
      setTriviaTitle(payload.triviaTitle);
      setPhase((p) => (p === "connecting" ? "lobby" : p));
    };
    const onQuestion = (payload: PublicQuestion) => {
      setQuestion(payload);
      setSelectedOptionId(null);
      setAnsweredCount(0);
      setSummary(null);
      setMyResult(null);
      setRanking(null);
      setPhase("question");
    };
    const onAnswerCount = (payload: { count: number }) => setAnsweredCount(payload.count);
    const onSummary = (payload: SummaryPayload) => {
      setSummary(payload);
      setPhase("summary");
    };
    const onMyResult = (payload: MyResultPayload) => setMyResult(payload);
    const onRanking = (payload: { ranking: RankingEntry[] }) => {
      setRanking(payload.ranking);
      setPhase("ranking");
    };
    const onFinished = (payload: { ranking: RankingEntry[] }) => {
      setFinalRanking(payload.ranking);
      setPhase("finished");
    };
    const onReturnedToLobby = () => {
      setQuestion(null);
      setSelectedOptionId(null);
      setAnsweredCount(0);
      setSummary(null);
      setMyResult(null);
      setRanking(null);
      setFinalRanking(null);
      setPhase("lobby");
    };
    const onError = (payload: { message: string }) => setErrorMsg(payload.message);
    const onClosed = () => setPhase("lost");

    socket.on("room:playersUpdate", onPlayersUpdate);
    socket.on("room:question", onQuestion);
    socket.on("room:answerCount", onAnswerCount);
    socket.on("room:summary", onSummary);
    socket.on("room:myResult", onMyResult);
    socket.on("room:ranking", onRanking);
    socket.on("room:finished", onFinished);
    socket.on("room:returnedToLobby", onReturnedToLobby);
    socket.on("room:error", onError);
    socket.on("room:closed", onClosed);

    socket.emit("room:sync", { code });

    return () => {
      socket.off("room:playersUpdate", onPlayersUpdate);
      socket.off("room:question", onQuestion);
      socket.off("room:answerCount", onAnswerCount);
      socket.off("room:summary", onSummary);
      socket.off("room:myResult", onMyResult);
      socket.off("room:ranking", onRanking);
      socket.off("room:finished", onFinished);
      socket.off("room:returnedToLobby", onReturnedToLobby);
      socket.off("room:error", onError);
      socket.off("room:closed", onClosed);
    };
  }, [code]);

  useEffect(() => {
    if (phase !== "question" || !question) return;
    const tick = () => {
      const left = question.startedAt + question.durationMs - Date.now();
      setTimeLeftMs(Math.max(0, left));
    };
    tick();
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [phase, question]);

  function handleSelectTrivia(triviaId: string) {
    getConnectedTriviaSocket()?.emit("room:selectTrivia", { code, triviaId });
  }

  function handleAnswer(optionId: string) {
    const socket = getConnectedTriviaSocket();
    if (!socket || selectedOptionId) return;
    setSelectedOptionId(optionId);
    socket.emit("room:answer", { code, optionId });
  }

  function handleStart() {
    getConnectedTriviaSocket()?.emit("room:start", { code });
  }

  function handleShowRanking() {
    getConnectedTriviaSocket()?.emit("room:showRanking", { code });
  }

  function handleNext() {
    getConnectedTriviaSocket()?.emit("room:next", { code });
  }

  function handleReturnToLobby() {
    getConnectedTriviaSocket()?.emit("room:returnToLobby", { code });
  }

  function handleLeave() {
    getConnectedTriviaSocket()?.emit("room:leave", { code });
    router.push("/didacticas/trivias");
  }

  if (phase === "lost") {
    return (
      <div className="flex flex-col items-center gap-4 text-center text-white">
        <p className="text-xl font-semibold">Perdiste la conexión con la sala.</p>
        <p className="text-white/80">
          Vuelve a Trivias y únete de nuevo con el código <span className="font-mono font-bold">{code}</span>.
        </p>
        <Button
          render={<Link href="/didacticas/trivias" />}
          nativeButton={false}
          className="bg-white text-violet-700 hover:bg-white/90"
        >
          Volver a Trivias
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6">
      {errorMsg && <p className="rounded-lg bg-white/20 px-4 py-2 text-sm text-white">{errorMsg}</p>}

      {phase === "connecting" && <p className="text-white/80">Conectando...</p>}

      {phase === "lobby" && (
        <RoomLobby
          code={code}
          triviaTitle={triviaTitle}
          players={players}
          isHost={isHost}
          availableTrivias={availableTrivias}
          onSelectTrivia={handleSelectTrivia}
          onStart={handleStart}
          onLeave={handleLeave}
        />
      )}

      {phase === "question" && question && (
        <QuestionView
          question={question}
          timeLeftMs={timeLeftMs}
          selectedOptionId={selectedOptionId}
          answeredCount={answeredCount}
          totalPlayers={players.length}
          onAnswer={handleAnswer}
        />
      )}

      {phase === "summary" && summary && question && (
        <AnswerSummaryView
          question={question}
          summary={summary}
          myResult={myResult}
          isHost={isHost}
          onShowRanking={handleShowRanking}
        />
      )}

      {phase === "ranking" && ranking && (
        <RankingView
          ranking={ranking}
          isHost={isHost}
          isLastQuestion={question ? question.index + 1 >= question.total : false}
          onNext={handleNext}
        />
      )}

      {phase === "finished" && finalRanking && (
        <FinalPodium
          ranking={finalRanking}
          isHost={isHost}
          onReturnToLobby={handleReturnToLobby}
          onLeave={handleLeave}
        />
      )}
    </div>
  );
}

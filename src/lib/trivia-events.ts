export const QUESTION_DURATION_MS = 20_000;
export const MAX_PLAYERS_PER_ROOM = 15;
export const MIN_SCORE_RATIO = 0.1;
export const DEFAULT_OPTION_POINTS = 1000;

export type OptionColor = "red" | "blue" | "yellow" | "green";

export const OPTION_COLORS: OptionColor[] = ["red", "blue", "yellow", "green"];

export type PublicOption = { id: string; text: string; color: OptionColor };

export type PublicQuestion = {
  index: number;
  total: number;
  text: string;
  options: PublicOption[];
  durationMs: number;
  startedAt: number;
};

export type RankingEntry = { userId: string; name: string; score: number };

export type SummaryPayload = {
  correctOptionIds: string[];
  optionCounts: Record<string, number>;
};

export type MyResultPayload = {
  correct: boolean;
  gained: number;
};

export type PlayerSummary = { userId: string; name: string };

export type RoomStatus = "lobby" | "question" | "summary" | "ranking" | "finished";

export type RoomErrorPayload = { message: string };

export type ClientToServerEvents = {
  "room:create": (ack: (res: { code: string } | { error: string }) => void) => void;
  "room:join": (payload: { code: string }, ack: (res: { ok: true } | { error: string }) => void) => void;
  "room:selectTrivia": (payload: { code: string; triviaId: string }) => void;
  "room:start": (payload: { code: string }) => void;
  "room:answer": (payload: { code: string; optionId: string }) => void;
  "room:showRanking": (payload: { code: string }) => void;
  "room:next": (payload: { code: string }) => void;
  "room:returnToLobby": (payload: { code: string }) => void;
  "room:leave": (payload: { code: string }) => void;
  "room:sync": (payload: { code: string }) => void;
};

export type ServerToClientEvents = {
  "room:playersUpdate": (payload: {
    players: PlayerSummary[];
    hostName: string;
    triviaTitle: string;
    questionCount: number;
  }) => void;
  "room:question": (payload: PublicQuestion) => void;
  "room:answerCount": (payload: { count: number }) => void;
  "room:summary": (payload: SummaryPayload) => void;
  "room:myResult": (payload: MyResultPayload) => void;
  "room:ranking": (payload: { ranking: RankingEntry[] }) => void;
  "room:finished": (payload: { ranking: RankingEntry[] }) => void;
  "room:returnedToLobby": () => void;
  "room:error": (payload: RoomErrorPayload) => void;
  "room:closed": () => void;
};

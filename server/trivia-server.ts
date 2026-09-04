import "dotenv/config";
import { createServer } from "node:http";
import { Server, type Socket } from "socket.io";
import { db } from "@/lib/db";
import { verifyTriviaSocketToken } from "@/lib/trivia-auth";
import {
  MAX_PLAYERS_PER_ROOM,
  MIN_SCORE_RATIO,
  OPTION_COLORS,
  QUESTION_DURATION_MS,
  type ClientToServerEvents,
  type RankingEntry,
  type ServerToClientEvents,
} from "@/lib/trivia-events";

type FullOption = { id: string; text: string; isCorrect: boolean; points: number };
type FullQuestion = { id: string; text: string; options: FullOption[] };

type Player = { userId: string; name: string; socketId: string; score: number };

type RoomState = {
  code: string;
  hostUserId: string;
  hostSocketId: string;
  triviaTitle: string;
  questions: FullQuestion[];
  status: "lobby" | "question" | "summary" | "ranking" | "finished";
  currentIndex: number;
  questionStartedAt: number | null;
  answers: Map<string, { optionId: string; answeredAt: number }>;
  lastGained: Map<string, number>;
  players: Map<string, Player>;
  timer: NodeJS.Timeout | null;
};

const rooms = new Map<string, RoomState>();

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code: string;
  do {
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  } while (rooms.has(code));
  return code;
}

function scoreFor(basePoints: number, elapsedMs: number): number {
  const clamped = Math.min(Math.max(elapsedMs, 0), QUESTION_DURATION_MS);
  const minPoints = basePoints * MIN_SCORE_RATIO;
  return Math.round(minPoints + (basePoints - minPoints) * (1 - clamped / QUESTION_DURATION_MS));
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildRanking(room: RoomState): RankingEntry[] {
  return [...room.players.values()]
    .map((p) => ({ userId: p.userId, name: p.name, score: p.score }))
    .sort((a, b) => b.score - a.score);
}

function publicQuestionPayload(room: RoomState) {
  const question = room.questions[room.currentIndex];
  return {
    index: room.currentIndex,
    total: room.questions.length,
    text: question.text,
    options: question.options.map((o, i) => ({
      id: o.id,
      text: o.text,
      color: OPTION_COLORS[i % OPTION_COLORS.length],
    })),
    durationMs: QUESTION_DURATION_MS,
    startedAt: room.questionStartedAt ?? Date.now(),
  };
}

function summaryPayload(room: RoomState) {
  const question = room.questions[room.currentIndex];
  const correctOptionIds = question.options.filter((o) => o.isCorrect).map((o) => o.id);
  const optionCounts: Record<string, number> = {};
  for (const option of question.options) optionCounts[option.id] = 0;
  for (const answer of room.answers.values()) {
    optionCounts[answer.optionId] = (optionCounts[answer.optionId] ?? 0) + 1;
  }
  return { correctOptionIds, optionCounts };
}

function emitPlayersUpdate(io: Server<ClientToServerEvents, ServerToClientEvents>, room: RoomState) {
  io.to(room.code).emit("room:playersUpdate", {
    players: [...room.players.values()].map((p) => ({ userId: p.userId, name: p.name })),
    hostName: room.players.get(room.hostUserId)?.name ?? "Anfitrión",
    triviaTitle: room.triviaTitle,
    questionCount: room.questions.length,
  });
}

function sendStateTo(socket: Socket<ClientToServerEvents, ServerToClientEvents>, userId: string, room: RoomState) {
  socket.emit("room:playersUpdate", {
    players: [...room.players.values()].map((p) => ({ userId: p.userId, name: p.name })),
    hostName: room.players.get(room.hostUserId)?.name ?? "Anfitrión",
    triviaTitle: room.triviaTitle,
    questionCount: room.questions.length,
  });

  if (room.status === "question") {
    socket.emit("room:question", publicQuestionPayload(room));
    socket.emit("room:answerCount", { count: room.answers.size });
  } else if (room.status === "summary") {
    const summary = summaryPayload(room);
    socket.emit("room:summary", summary);
    const gained = room.lastGained.get(userId) ?? 0;
    socket.emit("room:myResult", { correct: gained > 0, gained });
  } else if (room.status === "ranking") {
    socket.emit("room:ranking", { ranking: buildRanking(room) });
  } else if (room.status === "finished") {
    socket.emit("room:finished", { ranking: buildRanking(room) });
  }
}

function sendQuestion(io: Server<ClientToServerEvents, ServerToClientEvents>, room: RoomState) {
  room.answers = new Map();
  room.lastGained = new Map();
  room.questionStartedAt = Date.now();
  room.status = "question";

  io.to(room.code).emit("room:question", publicQuestionPayload(room));

  if (room.timer) clearTimeout(room.timer);
  room.timer = setTimeout(() => showSummary(io, room), QUESTION_DURATION_MS);
}

function showSummary(io: Server<ClientToServerEvents, ServerToClientEvents>, room: RoomState) {
  if (room.status !== "question") return;
  if (room.timer) clearTimeout(room.timer);
  room.status = "summary";

  const question = room.questions[room.currentIndex];

  for (const [userId, answer] of room.answers) {
    const player = room.players.get(userId);
    if (!player) continue;
    const chosenOption = question.options.find((o) => o.id === answer.optionId);
    const gained =
      chosenOption?.isCorrect
        ? scoreFor(chosenOption.points, answer.answeredAt - (room.questionStartedAt ?? answer.answeredAt))
        : 0;
    player.score += gained;
    room.lastGained.set(userId, gained);
  }

  const summary = summaryPayload(room);
  io.to(room.code).emit("room:summary", summary);

  for (const player of room.players.values()) {
    const gained = room.lastGained.get(player.userId) ?? 0;
    io.to(player.socketId).emit("room:myResult", { correct: gained > 0, gained });
  }
}

function maybeAutoReveal(io: Server<ClientToServerEvents, ServerToClientEvents>, room: RoomState) {
  if (room.status !== "question") return;
  if (room.players.size > 0 && room.answers.size >= room.players.size) {
    showSummary(io, room);
  }
}

function returnToLobby(io: Server<ClientToServerEvents, ServerToClientEvents>, room: RoomState) {
  if (room.timer) clearTimeout(room.timer);
  room.status = "lobby";
  room.triviaTitle = "";
  room.questions = [];
  room.currentIndex = 0;
  room.questionStartedAt = null;
  room.answers = new Map();
  room.lastGained = new Map();
  room.timer = null;
  for (const player of room.players.values()) player.score = 0;

  io.to(room.code).emit("room:returnedToLobby");
  emitPlayersUpdate(io, room);
}

export function createTriviaServer() {
  const httpServer = createServer();
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    path: "/socket.io",
    cors: { origin: "*" },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (typeof token !== "string") return next(new Error("No autenticado"));
    try {
      const payload = verifyTriviaSocketToken(token);
      socket.data.userId = payload.sub;
      socket.data.name = payload.name;
      next();
    } catch {
      next(new Error("Token inválido"));
    }
  });

  io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    const userId = socket.data.userId as string;
    const name = socket.data.name as string;

    socket.on("room:create", (ack) => {
      const code = generateRoomCode();
      const room: RoomState = {
        code,
        hostUserId: userId,
        hostSocketId: socket.id,
        triviaTitle: "",
        questions: [],
        status: "lobby",
        currentIndex: 0,
        questionStartedAt: null,
        answers: new Map(),
        lastGained: new Map(),
        players: new Map([[userId, { userId, name, socketId: socket.id, score: 0 }]]),
        timer: null,
      };
      rooms.set(code, room);
      socket.join(code);
      ack({ code });
      emitPlayersUpdate(io, room);
    });

    socket.on("room:join", ({ code }, ack) => {
      const room = rooms.get(code.toUpperCase());
      if (!room) return ack({ error: "No existe una sala con ese código." });
      if (room.status !== "lobby") return ack({ error: "La partida ya comenzó." });
      if (userId === room.hostUserId) return ack({ error: "Eres el anfitrión de esta sala." });

      const alreadyIn = room.players.has(userId);
      if (!alreadyIn && room.players.size >= MAX_PLAYERS_PER_ROOM) {
        return ack({ error: "La sala ya tiene el máximo de 15 jugadores." });
      }

      room.players.set(userId, { userId, name, socketId: socket.id, score: room.players.get(userId)?.score ?? 0 });
      socket.join(room.code);
      ack({ ok: true });
      emitPlayersUpdate(io, room);
    });

    socket.on("room:selectTrivia", async ({ code, triviaId }) => {
      const room = rooms.get(code);
      if (!room || room.hostUserId !== userId || room.status !== "lobby") return;

      const trivia = await db.trivia.findUnique({
        where: { id: triviaId },
        include: { questions: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } } },
      });
      if (!trivia || trivia.questions.length === 0) {
        io.to(socket.id).emit("room:error", { message: "Esa trivia no existe o no tiene preguntas." });
        return;
      }

      room.triviaTitle = trivia.title;
      const orderedQuestions = trivia.questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options.map((o) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect, points: o.points })),
      }));
      room.questions = trivia.shuffleQuestions ? shuffle(orderedQuestions) : orderedQuestions;
      room.currentIndex = 0;
      emitPlayersUpdate(io, room);
    });

    socket.on("room:sync", ({ code }) => {
      const room = rooms.get(code);
      if (!room) return;
      if (userId !== room.hostUserId && !room.players.has(userId)) return;
      sendStateTo(socket, userId, room);
    });

    socket.on("room:start", ({ code }) => {
      const room = rooms.get(code);
      if (!room || room.hostUserId !== userId || room.status !== "lobby") return;
      if (room.questions.length === 0) {
        io.to(socket.id).emit("room:error", { message: "Selecciona una trivia antes de iniciar." });
        return;
      }
      sendQuestion(io, room);
    });

    socket.on("room:answer", ({ code, optionId }) => {
      const room = rooms.get(code);
      if (!room || room.status !== "question") return;
      if (room.answers.has(userId)) return;
      room.answers.set(userId, { optionId, answeredAt: Date.now() });
      io.to(room.code).emit("room:answerCount", { count: room.answers.size });
      maybeAutoReveal(io, room);
    });

    socket.on("room:showRanking", ({ code }) => {
      const room = rooms.get(code);
      if (!room || room.hostUserId !== userId || room.status !== "summary") return;
      room.status = "ranking";
      io.to(room.code).emit("room:ranking", { ranking: buildRanking(room) });
    });

    socket.on("room:next", ({ code }) => {
      const room = rooms.get(code);
      if (!room || room.hostUserId !== userId || room.status !== "ranking") return;

      if (room.currentIndex + 1 >= room.questions.length) {
        room.status = "finished";
        io.to(room.code).emit("room:finished", { ranking: buildRanking(room) });
        return;
      }
      room.currentIndex += 1;
      sendQuestion(io, room);
    });

    socket.on("room:returnToLobby", ({ code }) => {
      const room = rooms.get(code);
      if (!room || room.hostUserId !== userId || room.status !== "finished") return;
      returnToLobby(io, room);
    });

    socket.on("room:leave", ({ code }) => {
      const room = rooms.get(code);
      if (!room) return;
      room.players.delete(userId);
      socket.leave(code);
      if (room.players.size === 0 || userId === room.hostUserId) {
        if (room.timer) clearTimeout(room.timer);
        rooms.delete(code);
        io.to(code).emit("room:closed");
      } else {
        emitPlayersUpdate(io, room);
      }
    });

    socket.on("disconnect", () => {
      for (const room of rooms.values()) {
        if (!room.players.has(userId)) continue;
        if (room.players.get(userId)?.socketId !== socket.id) continue;
        room.players.delete(userId);
        if (room.players.size === 0 || userId === room.hostUserId) {
          if (room.timer) clearTimeout(room.timer);
          rooms.delete(room.code);
          io.to(room.code).emit("room:closed");
        } else {
          emitPlayersUpdate(io, room);
        }
      }
    });
  });

  return httpServer;
}

if (require.main === module) {
  const port = Number(process.env.TRIVIA_SOCKET_PORT ?? 4001);
  createTriviaServer().listen(port, () => {
    console.log(`Trivia socket server listening on :${port}`);
  });
}

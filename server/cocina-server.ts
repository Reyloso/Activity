import "dotenv/config";
import { createServer } from "node:http";
import { Server, type Socket } from "socket.io";
import { verifyCocinaSocketToken } from "@/lib/cocina-auth";
import {
  DEFAULT_NUM_TEAMS,
  DEFAULT_TEAM_SIZE,
  MATCH_DURATION_MS,
  MAX_TEAM_SIZE,
  MAX_TEAMS,
  MIN_TEAM_SIZE,
  MIN_TEAMS,
  PLAYER_COLORS,
  emptyScoresFor,
  teamIdsFor,
  type ClientToServerEvents,
  type PlayerSummary,
  type RoomConfig,
  type ServerToClientEvents,
  type TeamId,
  type TeamScores,
} from "@/lib/cocina-events";

type Player = {
  userId: string;
  name: string;
  socketId: string;
  team: TeamId | null;
  colorId: string | null;
};

type RoomState = {
  code: string;
  hostUserId: string;
  status: "lobby" | "playing" | "finished";
  numTeams: number;
  teamSize: number;
  players: Map<string, Player>;
  scores: TeamScores;
  matchEndsAt: number | null;
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function roomConfig(room: RoomState): RoomConfig {
  return { numTeams: room.numTeams, teamSize: room.teamSize };
}

function playerSummaries(room: RoomState): PlayerSummary[] {
  return [...room.players.values()].map((p) => ({
    userId: p.userId,
    name: p.name,
    team: p.team,
    colorId: p.colorId,
  }));
}

function emitPlayersUpdate(io: Server<ClientToServerEvents, ServerToClientEvents>, room: RoomState) {
  io.to(room.code).emit("room:playersUpdate", {
    players: playerSummaries(room),
    hostName: room.players.get(room.hostUserId)?.name ?? "Anfitrión",
    status: room.status,
    config: roomConfig(room),
  });
}

function sendStateTo(socket: Socket<ClientToServerEvents, ServerToClientEvents>, room: RoomState) {
  socket.emit("room:playersUpdate", {
    players: playerSummaries(room),
    hostName: room.players.get(room.hostUserId)?.name ?? "Anfitrión",
    status: room.status,
    config: roomConfig(room),
  });
  if (room.status === "playing" && room.matchEndsAt) {
    socket.emit("room:started", { matchEndsAt: room.matchEndsAt, scores: room.scores });
  } else if (room.status === "finished") {
    socket.emit("room:finished", { scores: room.scores, winner: winnerOf(room) });
  }
}

function winnerOf(room: RoomState): TeamId | "empate" {
  const entries = Object.entries(room.scores);
  let best: [TeamId, number][] = [];
  for (const [team, score] of entries) {
    if (best.length === 0 || score > best[0][1]) best = [[team, score]];
    else if (score === best[0][1]) best.push([team, score]);
  }
  if (best.length !== 1) return "empate";
  return best[0][0];
}

function teamCount(room: RoomState, team: TeamId) {
  let count = 0;
  for (const p of room.players.values()) if (p.team === team) count += 1;
  return count;
}

function finishMatch(io: Server<ClientToServerEvents, ServerToClientEvents>, room: RoomState) {
  if (room.timer) clearTimeout(room.timer);
  room.timer = null;
  room.status = "finished";
  room.matchEndsAt = null;
  io.to(room.code).emit("room:finished", { scores: room.scores, winner: winnerOf(room) });
}

function returnToLobby(io: Server<ClientToServerEvents, ServerToClientEvents>, room: RoomState) {
  if (room.timer) clearTimeout(room.timer);
  room.timer = null;
  room.status = "lobby";
  room.matchEndsAt = null;
  room.scores = emptyScoresFor(room.numTeams);
  io.to(room.code).emit("room:returnedToLobby");
  emitPlayersUpdate(io, room);
}

export function createCocinaServer() {
  const httpServer = createServer();
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    path: "/cocina-socket.io",
    cors: { origin: "*" },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (typeof token !== "string") return next(new Error("No autenticado"));
    try {
      const payload = verifyCocinaSocketToken(token);
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
        status: "lobby",
        numTeams: DEFAULT_NUM_TEAMS,
        teamSize: DEFAULT_TEAM_SIZE,
        players: new Map([[userId, { userId, name, socketId: socket.id, team: null, colorId: null }]]),
        scores: emptyScoresFor(DEFAULT_NUM_TEAMS),
        matchEndsAt: null,
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
      const capacity = room.numTeams * room.teamSize;
      if (!alreadyIn && room.players.size >= capacity) {
        return ack({ error: "La sala ya está llena." });
      }

      room.players.set(userId, {
        userId,
        name,
        socketId: socket.id,
        team: room.players.get(userId)?.team ?? null,
        colorId: room.players.get(userId)?.colorId ?? null,
      });
      socket.join(room.code);
      ack({ ok: true });
      emitPlayersUpdate(io, room);
    });

    socket.on("room:sync", ({ code }) => {
      const room = rooms.get(code);
      if (!room) return;
      if (!room.players.has(userId)) return;
      sendStateTo(socket, room);
    });

    socket.on("room:setConfig", ({ code, numTeams, teamSize }) => {
      const room = rooms.get(code);
      if (!room || room.hostUserId !== userId || room.status !== "lobby") return;
      room.numTeams = clamp(numTeams, MIN_TEAMS, MAX_TEAMS);
      room.teamSize = clamp(teamSize, MIN_TEAM_SIZE, MAX_TEAM_SIZE);
      const validTeams = new Set(teamIdsFor(room.numTeams));
      for (const player of room.players.values()) {
        if (player.team && !validTeams.has(player.team)) {
          player.team = null;
          player.colorId = null;
        }
      }
      room.scores = emptyScoresFor(room.numTeams);
      emitPlayersUpdate(io, room);
    });

    socket.on("room:setTeam", ({ code, team }) => {
      const room = rooms.get(code);
      if (!room || room.status !== "lobby") return;
      const player = room.players.get(userId);
      if (!player) return;
      if (!teamIdsFor(room.numTeams).includes(team)) return;
      if (player.team !== team && teamCount(room, team) >= room.teamSize) {
        socket.emit("room:error", { message: "Ese equipo ya está lleno." });
        return;
      }
      player.team = team;
      if (
        player.colorId &&
        [...room.players.values()].some((p) => p.userId !== userId && p.team === team && p.colorId === player.colorId)
      ) {
        player.colorId = null;
      }
      emitPlayersUpdate(io, room);
    });

    socket.on("room:setColor", ({ code, colorId }) => {
      const room = rooms.get(code);
      if (!room || room.status !== "lobby") return;
      const player = room.players.get(userId);
      if (!player || !PLAYER_COLORS.some((c) => c.id === colorId)) return;
      const taken = [...room.players.values()].some(
        (p) => p.userId !== userId && p.team === player.team && p.colorId === colorId,
      );
      if (taken) {
        socket.emit("room:error", { message: "Ese color ya lo tiene alguien de tu equipo." });
        return;
      }
      player.colorId = colorId;
      emitPlayersUpdate(io, room);
    });

    socket.on("room:start", ({ code }) => {
      const room = rooms.get(code);
      if (!room || room.hostUserId !== userId || room.status !== "lobby") return;

      const players = [...room.players.values()];
      if (players.some((p) => !p.team || !p.colorId)) {
        socket.emit("room:error", { message: "Todos deben elegir equipo y color antes de iniciar." });
        return;
      }
      const usedTeams = new Set(players.map((p) => p.team));
      if (usedTeams.size < 2) {
        socket.emit("room:error", { message: "Necesitas jugadores repartidos en al menos 2 equipos." });
        return;
      }

      room.status = "playing";
      room.scores = emptyScoresFor(room.numTeams);
      room.matchEndsAt = Date.now() + MATCH_DURATION_MS;
      io.to(room.code).emit("room:started", { matchEndsAt: room.matchEndsAt, scores: room.scores });

      if (room.timer) clearTimeout(room.timer);
      room.timer = setTimeout(() => finishMatch(io, room), MATCH_DURATION_MS);
    });

    socket.on("room:deliver", ({ code, points }) => {
      const room = rooms.get(code);
      if (!room || room.status !== "playing") return;
      const player = room.players.get(userId);
      if (!player || !player.team) return;
      room.scores[player.team] = (room.scores[player.team] ?? 0) + Math.max(0, Math.round(points));
      io.to(room.code).emit("room:scores", { scores: room.scores });
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
  const port = Number(process.env.COCINA_SOCKET_PORT ?? 4002);
  createCocinaServer().listen(port, () => {
    console.log(`Cocina Loca socket server listening on :${port}`);
  });
}

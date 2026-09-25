import type { ActiveOrder, BoardItem, Carrying, EstufaId, MesonId, StoveSlot, TablaId } from "@/lib/kitchen-sim";
import { DEFAULT_RECIPE_IDS } from "@/lib/kitchen-sim";

export const MIN_TEAMS = 2;
export const MAX_TEAMS = 6;
export const MIN_TEAM_SIZE = 1;
export const MAX_TEAM_SIZE = 6;
export const DEFAULT_NUM_TEAMS = 2;
export const DEFAULT_TEAM_SIZE = 4;

export const MATCH_DURATION_MS = 5 * 60_000;

export type TeamId = string;

export type PlayerColor = { id: string; label: string; hex: string };

export const PLAYER_COLORS: PlayerColor[] = [
  { id: "rojo", label: "Rojo", hex: "#ef4444" },
  { id: "azul", label: "Azul", hex: "#3b82f6" },
  { id: "verde", label: "Verde", hex: "#22c55e" },
  { id: "amarillo", label: "Amarillo", hex: "#eab308" },
  { id: "morado", label: "Morado", hex: "#a855f7" },
  { id: "naranja", label: "Naranja", hex: "#f97316" },
  { id: "rosado", label: "Rosado", hex: "#ec4899" },
  { id: "cian", label: "Cian", hex: "#06b6d4" },
];

export type PlayerSummary = {
  userId: string;
  name: string;
  team: TeamId | null;
  colorId: string | null;
};

export type TeamScores = Record<TeamId, number>;

export type RoomStatus = "lobby" | "playing" | "finished";

export type RoomConfig = { numTeams: number; teamSize: number; enabledRecipeIds: string[] };

export const DEFAULT_ENABLED_RECIPE_IDS = DEFAULT_RECIPE_IDS;

export type RoomErrorPayload = { message: string };

export type KitchenPlayerPublic = {
  position: [number, number, number];
  facing: number;
  carrying: Carrying;
  color: string;
  message: string | null;
};

export type KitchenStatePayload = {
  players: Record<string, KitchenPlayerPublic>;
  boards: Record<TablaId, BoardItem>;
  stoves: Record<EstufaId, StoveSlot>;
  mesonSlots: Record<MesonId, Carrying>;
  cleanPlates: number;
  dirtyPlates: number;
  washQueue: number;
  washProgress: number;
  orders: ActiveOrder[];
};

export function teamLabel(team: TeamId) {
  return `Equipo ${team}`;
}

export function teamIdsFor(numTeams: number): TeamId[] {
  return Array.from({ length: numTeams }, (_, i) => String(i + 1));
}

export function emptyScoresFor(numTeams: number): TeamScores {
  const scores: TeamScores = {};
  for (const team of teamIdsFor(numTeams)) scores[team] = 0;
  return scores;
}

export type ClientToServerEvents = {
  "room:create": (ack: (res: { code: string } | { error: string }) => void) => void;
  "room:join": (payload: { code: string }, ack: (res: { ok: true } | { error: string }) => void) => void;
  "room:setConfig": (payload: { code: string; numTeams: number; teamSize: number }) => void;
  "room:setRecipes": (payload: { code: string; recipeIds: string[] }) => void;
  "room:setTeam": (payload: { code: string; team: TeamId }) => void;
  "room:start": (payload: { code: string }) => void;
  "room:restartMatch": (payload: { code: string }) => void;
  "room:returnToLobby": (payload: { code: string }) => void;
  "room:leave": (payload: { code: string }) => void;
  "room:sync": (payload: { code: string }) => void;
  "kitchen:move": (payload: { code: string; dx: number; dz: number }) => void;
  "kitchen:space": (payload: { code: string; held: boolean }) => void;
  "kitchen:interact": (payload: { code: string }) => void;
};

export type ServerToClientEvents = {
  "room:playersUpdate": (payload: {
    players: PlayerSummary[];
    hostName: string;
    status: RoomStatus;
    config: RoomConfig;
  }) => void;
  "room:started": (payload: { matchEndsAt: number; scores: TeamScores }) => void;
  "room:scores": (payload: { scores: TeamScores }) => void;
  "room:finished": (payload: { scores: TeamScores; winner: TeamId | "empate" }) => void;
  "room:returnedToLobby": () => void;
  "room:error": (payload: RoomErrorPayload) => void;
  "room:closed": () => void;
  "kitchen:state": (payload: KitchenStatePayload) => void;
};

export type StationId =
  | "cofreLechuga"
  | "cofreTomate"
  | "tabla1"
  | "tabla2"
  | "estufa1"
  | "estufa2"
  | "meson1"
  | "meson2"
  | "meson3"
  | "meson4"
  | "platos"
  | "entrega"
  | "lavaplatos"
  | "basura";

export const TABLA_IDS = ["tabla1", "tabla2"] as const;
export const ESTUFA_IDS = ["estufa1", "estufa2"] as const;
export const MESON_IDS = ["meson1", "meson2", "meson3", "meson4"] as const;

export type TablaId = (typeof TABLA_IDS)[number];
export type EstufaId = (typeof ESTUFA_IDS)[number];
export type MesonId = (typeof MESON_IDS)[number];

export type Ingredient = "lechuga" | "tomate";

export type BoardItem = { ingredient: Ingredient; chopped: boolean } | null;

export type StoveItem = { progress: number; state: "cocinando" | "listo" | "quemado" } | null;

export type PlateContent = "lechuga" | "salsa";

export type Carrying =
  | null
  | { kind: "ingrediente"; ingrediente: Ingredient; chopped: boolean }
  | { kind: "salsa" }
  | { kind: "quemado" }
  | { kind: "plato"; contenido: PlateContent[] }
  | { kind: "platoSucio" };

export type GameState = {
  carrying: Carrying;
  boards: Record<TablaId, BoardItem>;
  stoves: Record<EstufaId, StoveItem>;
  mesonSlots: Record<MesonId, Carrying>;
  cleanPlates: number;
  dirtyPlates: number;
  washProgress: number;
  chopProgress: number;
  score: number;
  orderSecondsLeft: number;
  message: string | null;
};

export const RECIPE: PlateContent[] = ["lechuga", "salsa"];
export const ORDER_SECONDS = 60;
export const CHOP_TARGET = 1.4; // segundos de picado sostenido
export const WASH_TARGET = 1.6; // segundos de lavado sostenido
export const COOK_DONE_AT = 4; // segundos hasta que la salsa está lista
export const COOK_BURN_AT = 9; // segundos hasta que se quema si no se recoge

export function initialGameState(): GameState {
  return {
    carrying: null,
    boards: { tabla1: null, tabla2: null },
    stoves: { estufa1: null, estufa2: null },
    mesonSlots: { meson1: null, meson2: null, meson3: null, meson4: null },
    cleanPlates: 3,
    dirtyPlates: 0,
    washProgress: 0,
    chopProgress: 0,
    score: 0,
    orderSecondsLeft: ORDER_SECONDS,
    message: null,
  };
}

export function plateMatchesRecipe(contenido: PlateContent[]) {
  if (contenido.length !== RECIPE.length) return false;
  return RECIPE.every((item) => contenido.includes(item));
}

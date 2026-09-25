export type StationId =
  | "cofreLechuga"
  | "cofreTomate"
  | "tabla"
  | "estufa"
  | "meson"
  | "platos"
  | "entrega"
  | "lavaplatos"
  | "basura";

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

export type MesonSlot = { contenido: PlateContent[] } | null;

export type GameState = {
  carrying: Carrying;
  board: BoardItem;
  stove: StoveItem;
  mesonSlot: MesonSlot;
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
    board: null,
    stove: null,
    mesonSlot: null,
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

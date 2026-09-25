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
  | "platosSucios"
  | "basura";

export const TABLA_IDS = ["tabla1", "tabla2"] as const;
export const ESTUFA_IDS = ["estufa1", "estufa2"] as const;
export const MESON_IDS = ["meson1", "meson2", "meson3", "meson4"] as const;

export type TablaId = (typeof TABLA_IDS)[number];
export type EstufaId = (typeof ESTUFA_IDS)[number];
export type MesonId = (typeof MESON_IDS)[number];

export type Ingredient = "lechuga" | "tomate" | "cebolla" | "camaron" | "pescado" | "carne";

export type BoardItem = { ingredient: Ingredient; chopped: boolean; chopProgress: number } | null;

export type PotContent = { ingredient: Ingredient; progress: number; state: "cocinando" | "listo" | "quemado" } | null;

export type StoveSlot = { potPresent: boolean; content: PotContent };

export type PlateContent = "lechuga" | "cebolla" | "salsa" | "camaron" | "pescado" | "carne";

export type Carrying =
  | null
  | { kind: "ingrediente"; ingrediente: Ingredient; chopped: boolean }
  | { kind: "quemado" }
  | { kind: "olla"; content: PotContent }
  | { kind: "plato"; contenido: PlateContent[] }
  | { kind: "platoSucio" };

export type GameState = {
  carrying: Carrying;
  boards: Record<TablaId, BoardItem>;
  stoves: Record<EstufaId, StoveSlot>;
  mesonSlots: Record<MesonId, Carrying>;
  cleanPlates: number;
  dirtyPlates: number;
  washQueue: number;
  washProgress: number;
  chopProgress: number;
  score: number;
  orderSecondsLeft: number;
  message: string | null;
};

export const RECIPE: PlateContent[] = ["lechuga", "salsa"];
export const ORDER_SECONDS = 60;
export const CHOP_TARGET = 1.4; // segundos de picado sostenido
export const WASH_TARGET = 3; // segundos de lavado sostenido, por plato
export const COOK_DONE_AT = 4; // segundos hasta que la salsa está lista
export const COOK_BURN_AT = 9; // segundos hasta que se quema si no se recoge

export function initialGameState(): GameState {
  return {
    carrying: null,
    boards: { tabla1: null, tabla2: null },
    stoves: {
      estufa1: { potPresent: true, content: null },
      estufa2: { potPresent: true, content: null },
    },
    mesonSlots: { meson1: null, meson2: null, meson3: null, meson4: null },
    cleanPlates: 3,
    dirtyPlates: 0,
    washQueue: 0,
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

/** Ingredientes que necesitan pasar por la estufa antes de ir al plato (más riesgo de quemarse = más puntos). */
const COOKED_PLATE_CONTENTS: PlateContent[] = ["salsa", "camaron", "pescado", "carne"];

/** Puntos que vale un plato con este contenido, de 0 a 100 (ver misma fórmula en lib/kitchen-sim.ts). */
export function plateValue(contenido: PlateContent[]): number {
  const cookedCount = contenido.filter((c) => COOKED_PLATE_CONTENTS.includes(c)).length;
  return Math.min(100, 30 + contenido.length * 15 + cookedCount * 25);
}

export const BURN_PENALTY = 20;

// Simulación de la cocina de Cocina Loca, compartida entre el cliente (modo
// práctica, un solo jugador local) y el servidor de sockets (modo multijugador,
// una cocina por equipo). No depende de React ni del DOM.

export const TABLA_IDS = ["tabla1", "tabla2"] as const;
export const ESTUFA_IDS = ["estufa1", "estufa2"] as const;
export const MESON_IDS = ["meson1", "meson2", "meson3", "meson4"] as const;

export type TablaId = (typeof TABLA_IDS)[number];
export type EstufaId = (typeof ESTUFA_IDS)[number];
export type MesonId = (typeof MESON_IDS)[number];

export type Ingredient = "lechuga" | "tomate" | "cebolla" | "camaron" | "pescado" | "carne";

/** Ingredientes que se sirven picados directamente, sin pasar por la estufa. */
const CHOP_ONLY_INGREDIENTS: Ingredient[] = ["lechuga", "cebolla"];

export type BoardItem = { ingredient: Ingredient; chopped: boolean; chopProgress: number } | null;

export type PotContent = { ingredient: Ingredient; progress: number; state: "cocinando" | "listo" | "quemado" } | null;

export type StoveSlot = { potPresent: boolean; content: PotContent };

export type PlateContent = "lechuga" | "cebolla" | "salsa" | "camaron" | "pescado" | "carne";

/** A qué se convierte un ingrediente cocinado al servirlo en el plato. */
function cookedContentFor(ingredient: Ingredient): PlateContent {
  if (ingredient === "tomate") return "salsa";
  return ingredient as PlateContent;
}

export type Carrying =
  | null
  | { kind: "ingrediente"; ingrediente: Ingredient; chopped: boolean }
  | { kind: "quemado" }
  | { kind: "olla"; content: PotContent }
  | { kind: "plato"; contenido: PlateContent[] }
  | { kind: "platoSucio" };

export type StationId =
  | "cofreLechuga"
  | "cofreTomate"
  | "cofreCebolla"
  | "cofreCamaron"
  | "cofrePescado"
  | "cofreCarne"
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

export type Recipe = { id: string; label: string; description: string; contents: PlateContent[] };

export const RECIPES: Recipe[] = [
  {
    id: "ensalada-salsa",
    label: "Ensalada con salsa",
    description: "Lechuga picada + tomate picado y cocinado, en un plato",
    contents: ["lechuga", "salsa"],
  },
  {
    id: "ensalada-mixta",
    label: "Ensalada mixta",
    description: "Lechuga picada + cebolla picada, en un plato",
    contents: ["lechuga", "cebolla"],
  },
  {
    id: "salsa-cebolla",
    label: "Salsa con cebolla",
    description: "Cebolla picada + tomate picado y cocinado, en un plato",
    contents: ["cebolla", "salsa"],
  },
  {
    id: "camarones-lechuga",
    label: "Camarones con lechuga",
    description: "Camarón picado y cocinado + lechuga picada, en un plato",
    contents: ["camaron", "lechuga"],
  },
  {
    id: "pescado-cebolla",
    label: "Pescado con cebolla",
    description: "Pescado picado y cocinado + cebolla picada, en un plato",
    contents: ["pescado", "cebolla"],
  },
  {
    id: "hamburguesa-clasica",
    label: "Hamburguesa clásica",
    description: "Carne picada y cocinada + lechuga picada, en un plato",
    contents: ["carne", "lechuga"],
  },
];

export const DEFAULT_RECIPE_IDS: string[] = RECIPES.map((r) => r.id);

export function getRecipe(id: string): Recipe {
  return RECIPES.find((r) => r.id === id) ?? RECIPES[0];
}

/** Ingredientes que necesitan pasar por la estufa antes de ir al plato (más riesgo de quemarse = más puntos). */
const COOKED_PLATE_CONTENTS: PlateContent[] = ["salsa", "camaron", "pescado", "carne"];

/**
 * Puntos que vale un plato con este contenido, de 0 a 100: una base por usar un plato,
 * más puntos por cada ingrediente y un extra por cada ingrediente que requirió cocción.
 * Se usa tanto para premiar una entrega correcta como para penalizar una incompleta
 * (se resta el valor de lo que efectivamente llevaba el plato entregado).
 */
export function plateValue(contenido: PlateContent[]): number {
  const cookedCount = contenido.filter((c) => COOKED_PLATE_CONTENTS.includes(c)).length;
  return Math.min(100, 30 + contenido.length * 15 + cookedCount * 25);
}

export const BURN_PENALTY = 20;

/** Elige una receta al azar de un conjunto habilitado (ids), evitando repetir `excludeId` si hay más de una opción. */
export function pickRecipeFromPool(enabledRecipeIds: string[], excludeId?: string): Recipe {
  const base = enabledRecipeIds.length > 0 ? enabledRecipeIds : DEFAULT_RECIPE_IDS;
  const options = excludeId ? base.filter((id) => id !== excludeId) : base;
  const pool = options.length > 0 ? options : base;
  const id = pool[Math.floor(Math.random() * pool.length)];
  return getRecipe(id);
}

export const ORDER_SECONDS = 60;
export const MAX_ACTIVE_ORDERS = 3;
export const CHOP_TARGET = 1.4;
export const WASH_TARGET = 3;
export const COOK_DONE_AT = 4;
export const COOK_BURN_AT = 9;

export const MOVE_SPEED = 3.4;
export const HALF_W = 7;
export const HALF_D = 5;
export const REACH_DIST = 0.95;
export const REACH_RADIUS = 0.62;
export const PLAYER_RADIUS = 0.32;

export const TABLA_PAIR_X = -1;
export const TABLA_PAIR_WIDTH = 1.85;
export const ESTUFA_PAIR_X = 2;
export const ESTUFA_PAIR_WIDTH = 1.85;
export const MESON_TABLE_CENTER_X = 2.65;
export const MESON_TABLE_WIDTH = 4.15;

export const STATIONS: { id: StationId; x: number; z: number; label: string; rotationY?: number }[] = [
  { id: "cofreLechuga", x: -5, z: -4, label: "Cofre de lechuga" },
  { id: "cofreTomate", x: -3.3, z: -4, label: "Cofre de tomate" },
  { id: "cofreCebolla", x: 4.3, z: -4, label: "Cofre de cebolla" },
  { id: "tabla1", x: -1.5, z: -4, label: "Tabla de picar 1" },
  { id: "tabla2", x: -0.5, z: -4, label: "Tabla de picar 2" },
  { id: "estufa1", x: 1.5, z: -4, label: "Estufa 1" },
  { id: "estufa2", x: 2.5, z: -4, label: "Estufa 2" },
  { id: "platos", x: -5, z: 0, label: "Platos" },
  { id: "platosSucios", x: -4.16, z: 0, label: "Platos sucios" },
  { id: "lavaplatos", x: -3.3, z: 0, label: "Lavaplatos" },
  { id: "basura", x: -1.6, z: 0, label: "Basura" },
  { id: "meson1", x: 1, z: 0, label: "Mesón" },
  { id: "meson2", x: 2.1, z: 0, label: "Mesón" },
  { id: "meson3", x: 3.2, z: 0, label: "Mesón" },
  { id: "meson4", x: 4.3, z: 0, label: "Mesón" },
  { id: "entrega", x: 7, z: 0, label: "Ventana de entrega", rotationY: -Math.PI / 2 },
  { id: "cofreCamaron", x: 3, z: 4, label: "Cofre de camarón" },
  { id: "cofrePescado", x: 4, z: 4, label: "Cofre de pescado" },
  { id: "cofreCarne", x: 5, z: 4, label: "Cofre de carne" },
];

type Obstacle = { x: number; z: number; hw: number; hd: number };

const OBSTACLES: Obstacle[] = [];
for (let x = -HALF_W + 1; x <= HALF_W - 1; x += 1) {
  OBSTACLES.push({ x, z: HALF_D, hw: 0.46, hd: 0.46 });
}
for (let z = -HALF_D + 1; z <= HALF_D - 1; z += 1) {
  OBSTACLES.push({ x: -HALF_W, z, hw: 0.46, hd: 0.46 });
  if (z !== 0) OBSTACLES.push({ x: HALF_W, z, hw: 0.46, hd: 0.46 });
}
OBSTACLES.push({ x: -5, z: -4, hw: 0.44, hd: 0.44 });
OBSTACLES.push({ x: -3.3, z: -4, hw: 0.44, hd: 0.44 });
OBSTACLES.push({ x: 4.3, z: -4, hw: 0.44, hd: 0.44 });
OBSTACLES.push({ x: TABLA_PAIR_X, z: -4, hw: TABLA_PAIR_WIDTH / 2, hd: 0.44 });
OBSTACLES.push({ x: ESTUFA_PAIR_X, z: -4, hw: ESTUFA_PAIR_WIDTH / 2, hd: 0.44 });
OBSTACLES.push({ x: -5, z: 0, hw: 0.44, hd: 0.44 });
OBSTACLES.push({ x: -4.16, z: 0, hw: 0.35, hd: 0.28 });
OBSTACLES.push({ x: -3.3, z: 0, hw: 0.44, hd: 0.44 });
OBSTACLES.push({ x: -1.6, z: 0, hw: 0.44, hd: 0.44 });
OBSTACLES.push({ x: MESON_TABLE_CENTER_X, z: 0, hw: MESON_TABLE_WIDTH / 2, hd: 0.44 });
OBSTACLES.push({ x: 7, z: 0, hw: 0.46, hd: 0.46 });
OBSTACLES.push({ x: 3, z: 4, hw: 0.44, hd: 0.44 });
OBSTACLES.push({ x: 4, z: 4, hw: 0.44, hd: 0.44 });
OBSTACLES.push({ x: 5, z: 4, hw: 0.44, hd: 0.44 });

export function collides(x: number, z: number) {
  for (const o of OBSTACLES) {
    const closestX = Math.max(o.x - o.hw, Math.min(x, o.x + o.hw));
    const closestZ = Math.max(o.z - o.hd, Math.min(z, o.z + o.hd));
    const dx = x - closestX;
    const dz = z - closestZ;
    if (dx * dx + dz * dz < PLAYER_RADIUS * PLAYER_RADIUS) return true;
  }
  return false;
}

export function getTargetStation(pos: [number, number, number], facing: number) {
  const fx = Math.sin(facing);
  const fz = Math.cos(facing);
  const tx = pos[0] + fx * REACH_DIST;
  const tz = pos[2] + fz * REACH_DIST;
  let closest: (typeof STATIONS)[number] | null = null;
  let bestDist = REACH_RADIUS;
  for (const station of STATIONS) {
    const d = Math.hypot(station.x - tx, station.z - tz);
    if (d < bestDist) {
      bestDist = d;
      closest = station;
    }
  }
  return closest;
}

export function plateMatchesContents(contenido: PlateContent[], recipeContents: PlateContent[]) {
  if (contenido.length !== recipeContents.length) return false;
  return recipeContents.every((item) => contenido.includes(item));
}

export type KitchenPlayer = {
  position: [number, number, number];
  facing: number;
  carrying: Carrying;
  color: string;
  message: string | null;
  messageUntil: number;
};

export type ActiveOrder = { id: string; recipeId: string; secondsLeft: number };

export type KitchenState = {
  players: Record<string, KitchenPlayer>;
  boards: Record<TablaId, BoardItem>;
  stoves: Record<EstufaId, StoveSlot>;
  mesonSlots: Record<MesonId, Carrying>;
  cleanPlates: number;
  dirtyPlates: number;
  washQueue: number;
  washProgress: number;
  score: number;
  enabledRecipeIds: string[];
  orders: ActiveOrder[];
};

export type PlayerInput = { dx: number; dz: number; spaceHeld: boolean; interact: boolean };

let orderCounter = 0;
function generateOrderId(): string {
  orderCounter += 1;
  return `order-${Date.now().toString(36)}-${orderCounter}`;
}

function freshOrder(enabledRecipeIds: string[], excludeId?: string): ActiveOrder {
  return { id: generateOrderId(), recipeId: pickRecipeFromPool(enabledRecipeIds, excludeId).id, secondsLeft: ORDER_SECONDS };
}

export function createKitchenState(enabledRecipeIds: string[] = DEFAULT_RECIPE_IDS): KitchenState {
  const pool = enabledRecipeIds.length > 0 ? enabledRecipeIds : DEFAULT_RECIPE_IDS;
  const orders: ActiveOrder[] = [];
  for (let i = 0; i < MAX_ACTIVE_ORDERS; i++) orders.push(freshOrder(pool));
  return {
    players: {},
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
    score: 0,
    enabledRecipeIds: pool,
    orders,
  };
}

export function addPlayer(state: KitchenState, playerId: string, color: string, seat: number) {
  const spawnX = (seat % 5) * 0.9 - 1.8;
  state.players[playerId] = {
    position: [spawnX, 0, 3.5],
    facing: 0,
    carrying: null,
    color,
    message: null,
    messageUntil: 0,
  };
}

export function removePlayer(state: KitchenState, playerId: string) {
  delete state.players[playerId];
}

function showMessage(state: KitchenState, playerId: string, text: string, now: number) {
  const player = state.players[playerId];
  if (!player) return;
  player.message = text;
  player.messageUntil = now + 1600;
}

function ingredientToCrate(stationId: StationId): Ingredient | null {
  if (stationId === "cofreLechuga") return "lechuga";
  if (stationId === "cofreTomate") return "tomate";
  if (stationId === "cofreCebolla") return "cebolla";
  if (stationId === "cofreCamaron") return "camaron";
  if (stationId === "cofrePescado") return "pescado";
  if (stationId === "cofreCarne") return "carne";
  return null;
}

function handleTabla(state: KitchenState, playerId: string, id: TablaId, now: number) {
  const player = state.players[playerId];
  const board = state.boards[id];
  if (board && board.chopped) {
    const asPlateContent = CHOP_ONLY_INGREDIENTS.includes(board.ingredient) ? (board.ingredient as PlateContent) : null;
    if (player.carrying === null) {
      player.carrying = { kind: "ingrediente", ingrediente: board.ingredient, chopped: true };
      state.boards[id] = null;
    } else if (
      player.carrying.kind === "plato" &&
      asPlateContent &&
      !player.carrying.contenido.includes(asPlateContent)
    ) {
      player.carrying.contenido.push(asPlateContent);
      state.boards[id] = null;
    } else {
      showMessage(state, playerId, "Tienes las manos ocupadas.", now);
    }
  } else if (board === null && player.carrying?.kind === "ingrediente") {
    state.boards[id] = { ingredient: player.carrying.ingrediente, chopped: player.carrying.chopped, chopProgress: 0 };
    player.carrying = null;
  }
}

function handleEstufa(state: KitchenState, playerId: string, id: EstufaId, now: number) {
  const player = state.players[playerId];
  const slot = state.stoves[id];
  if (slot.potPresent) {
    if (slot.content === null) {
      if (
        player.carrying?.kind === "ingrediente" &&
        player.carrying.chopped &&
        !CHOP_ONLY_INGREDIENTS.includes(player.carrying.ingrediente)
      ) {
        slot.content = { ingredient: player.carrying.ingrediente, progress: 0, state: "cocinando" };
        player.carrying = null;
      } else if (player.carrying === null) {
        player.carrying = { kind: "olla", content: null };
        slot.potPresent = false;
      } else {
        showMessage(state, playerId, "Tienes las manos ocupadas.", now);
      }
    } else if (player.carrying === null) {
      player.carrying = { kind: "olla", content: slot.content };
      slot.potPresent = false;
      slot.content = null;
    } else {
      showMessage(state, playerId, "Tienes las manos ocupadas.", now);
    }
  } else if (player.carrying?.kind === "olla") {
    slot.potPresent = true;
    slot.content = player.carrying.content;
    player.carrying = null;
  } else if (player.carrying !== null) {
    showMessage(state, playerId, "Aquí no hay una olla.", now);
  }
}

function handleMeson(state: KitchenState, playerId: string, id: MesonId, now: number) {
  const player = state.players[playerId];
  const slot = state.mesonSlots[id];
  if (slot === null) {
    if (player.carrying !== null) {
      state.mesonSlots[id] = player.carrying;
      player.carrying = null;
    }
    return;
  }
  if (player.carrying === null) {
    player.carrying = slot;
    state.mesonSlots[id] = null;
    return;
  }
  if (player.carrying.kind === "olla" && player.carrying.content?.state === "listo" && slot.kind === "plato") {
    const content = cookedContentFor(player.carrying.content.ingredient);
    if (!slot.contenido.includes(content)) {
      slot.contenido.push(content);
      player.carrying = { kind: "olla", content: null };
      return;
    }
  }
  if (
    player.carrying.kind === "ingrediente" &&
    player.carrying.chopped &&
    CHOP_ONLY_INGREDIENTS.includes(player.carrying.ingrediente) &&
    slot.kind === "plato" &&
    !slot.contenido.includes(player.carrying.ingrediente as PlateContent)
  ) {
    slot.contenido.push(player.carrying.ingrediente as PlateContent);
    player.carrying = null;
    return;
  }
  if (
    player.carrying.kind === "ingrediente" &&
    player.carrying.chopped &&
    !CHOP_ONLY_INGREDIENTS.includes(player.carrying.ingrediente) &&
    slot.kind === "plato"
  ) {
    showMessage(state, playerId, "Ese ingrediente necesita cocinarse primero.", now);
    return;
  }
  showMessage(state, playerId, "Tienes las manos ocupadas.", now);
}

function handleInteract(state: KitchenState, playerId: string, stationId: StationId, now: number) {
  const player = state.players[playerId];

  const crateIngredient = ingredientToCrate(stationId);
  if (crateIngredient) {
    if (player.carrying === null) {
      player.carrying = { kind: "ingrediente", ingrediente: crateIngredient, chopped: false };
    }
    return;
  }

  if ((TABLA_IDS as readonly string[]).includes(stationId)) {
    handleTabla(state, playerId, stationId as TablaId, now);
    return;
  }

  if ((ESTUFA_IDS as readonly string[]).includes(stationId)) {
    handleEstufa(state, playerId, stationId as EstufaId, now);
    return;
  }

  if ((MESON_IDS as readonly string[]).includes(stationId)) {
    handleMeson(state, playerId, stationId as MesonId, now);
    return;
  }

  if (stationId === "platos") {
    if (player.carrying === null && state.cleanPlates > 0) {
      player.carrying = { kind: "plato", contenido: [] };
      state.cleanPlates -= 1;
    } else if (player.carrying === null) {
      showMessage(state, playerId, "No quedan platos limpios.", now);
    }
    return;
  }

  if (stationId === "entrega") {
    if (player.carrying?.kind === "plato") {
      const carried = player.carrying;
      const orderIndex = state.orders.findIndex((o) => plateMatchesContents(carried.contenido, getRecipe(o.recipeId).contents));
      state.dirtyPlates += 1;
      player.carrying = null;
      if (orderIndex !== -1) {
        const served = state.orders[orderIndex];
        const points = plateValue(getRecipe(served.recipeId).contents);
        state.score += points;
        state.orders[orderIndex] = freshOrder(state.enabledRecipeIds, served.recipeId);
        showMessage(state, playerId, `¡Entregado! +${points}`, now);
      } else {
        const penalty = plateValue(carried.contenido);
        state.score = Math.max(0, state.score - penalty);
        showMessage(state, playerId, `Plato incompleto: -${penalty}`, now);
      }
    }
    return;
  }

  if (stationId === "platosSucios") {
    if (player.carrying === null && state.dirtyPlates > 0) {
      player.carrying = { kind: "platoSucio" };
      state.dirtyPlates -= 1;
    } else if (player.carrying === null) {
      showMessage(state, playerId, "No hay platos sucios aquí.", now);
    }
    return;
  }

  if (stationId === "lavaplatos") {
    if (player.carrying?.kind === "platoSucio") {
      state.washQueue += 1;
      player.carrying = null;
    }
    return;
  }

  if (stationId === "basura") {
    if (player.carrying?.kind === "olla") {
      if (player.carrying.content !== null) {
        player.carrying = { kind: "olla", content: null };
        showMessage(state, playerId, "Olla vacía otra vez.", now);
      }
      return;
    }
    if (player.carrying !== null) {
      if (player.carrying.kind === "plato") state.dirtyPlates += 1;
      player.carrying = null;
    }
    return;
  }
}

/** Avanza la simulación un paso. `now` es un timestamp en ms (Date.now() o performance.now(), consistente entre llamadas). */
export function tickKitchen(state: KitchenState, inputs: Record<string, PlayerInput>, dt: number, now: number) {
  for (const [playerId, player] of Object.entries(state.players)) {
    if (player.message && now > player.messageUntil) player.message = null;

    const input = inputs[playerId];
    if (!input) continue;

    let { dx, dz } = input;
    if (dx !== 0 || dz !== 0) {
      const len = Math.hypot(dx, dz);
      dx /= len;
      dz /= len;
      const prev = player.position;
      let nx = Math.min(HALF_W - 0.9, Math.max(-HALF_W + 0.9, prev[0] + dx * MOVE_SPEED * dt));
      let nz = Math.min(HALF_D - 0.9, Math.max(-HALF_D + 0.9, prev[2] + dz * MOVE_SPEED * dt));
      if (collides(nx, prev[2])) nx = prev[0];
      if (collides(nx, nz)) nz = prev[2];
      player.position = [nx, 0, nz];
      player.facing = Math.atan2(dx, dz);
    }

    const target = getTargetStation(player.position, player.facing);

    if (input.interact && target) {
      handleInteract(state, playerId, target.id, now);
    }

    const targetBoard =
      target && (TABLA_IDS as readonly string[]).includes(target.id) ? state.boards[target.id as TablaId] : null;
    if (input.spaceHeld && targetBoard && !targetBoard.chopped && player.carrying === null) {
      targetBoard.chopProgress += dt;
      if (targetBoard.chopProgress >= CHOP_TARGET) {
        targetBoard.chopped = true;
        targetBoard.chopProgress = 0;
      }
    }
  }

  const anyoneWashing = Object.entries(state.players).some(([playerId, player]) => {
    const input = inputs[playerId];
    if (!input?.spaceHeld || player.carrying !== null) return false;
    const target = getTargetStation(player.position, player.facing);
    return target?.id === "lavaplatos";
  });
  if (anyoneWashing && state.washQueue > 0) {
    state.washProgress += dt;
    if (state.washProgress >= WASH_TARGET) {
      state.washQueue -= 1;
      state.cleanPlates += 1;
      state.washProgress = 0;
    }
  } else {
    state.washProgress = 0;
  }

  for (const id of ESTUFA_IDS) {
    const slot = state.stoves[id];
    if (slot.potPresent && slot.content && slot.content.state === "cocinando") {
      slot.content.progress += dt;
      if (slot.content.progress >= COOK_BURN_AT) {
        slot.content.state = "quemado";
        state.score = Math.max(0, state.score - BURN_PENALTY);
      } else if (slot.content.progress >= COOK_DONE_AT) {
        slot.content.state = "listo";
      }
    }
  }

  for (const order of state.orders) order.secondsLeft -= dt;
  const expiredIndex = state.orders.findIndex((o) => o.secondsLeft <= 0);
  if (expiredIndex !== -1) {
    const expired = state.orders[expiredIndex];
    state.orders[expiredIndex] = freshOrder(state.enabledRecipeIds, expired.recipeId);
  }
}

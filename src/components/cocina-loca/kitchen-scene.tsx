"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ChefCharacter } from "@/components/cocina-loca/chef-character";
import { CarriedItem } from "@/components/cocina-loca/carried-item";
import { KitchenHud } from "@/components/cocina-loca/kitchen-hud";
import {
  AssemblyTable,
  ChoppingBoard,
  DeliveryWindow,
  LettuceCrate,
  PairedBase,
  PlateStack,
  Sink,
  Stove,
  TomatoCrate,
  TrashBin,
} from "@/components/cocina-loca/stations";
import {
  CHOP_TARGET,
  COOK_BURN_AT,
  COOK_DONE_AT,
  ESTUFA_IDS,
  MESON_IDS,
  ORDER_SECONDS,
  TABLA_IDS,
  WASH_TARGET,
  initialGameState,
  plateMatchesRecipe,
  type Carrying,
  type EstufaId,
  type GameState,
  type MesonId,
  type StationId,
  type TablaId,
} from "@/components/cocina-loca/game-types";

function FixedOverheadCamera() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

type RenderSnapshot = {
  position: [number, number, number];
  facing: number;
  carrying: Carrying;
  boards: GameState["boards"];
  stoves: GameState["stoves"];
  mesonSlots: GameState["mesonSlots"];
  cleanPlates: number;
  dirtyPlates: number;
  washProgress: number;
  chopProgress: number;
  chopTargetId: TablaId | null;
  score: number;
  orderSecondsLeft: number;
  message: string | null;
  targetLabel: string | null;
};

const MOVE_SPEED = 3.4; // unidades por segundo
const HALF_W = 7;
const HALF_D = 5;
const REACH_DIST = 0.95;
const REACH_RADIUS = 0.62;
const PLAYER_RADIUS = 0.32;

const KEY_TO_DIR: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  w: [0, -1],
  s: [0, 1],
  a: [-1, 0],
  d: [1, 0],
};

const TABLA_PAIR_X = -1;
const TABLA_PAIR_WIDTH = 1.85;
const ESTUFA_PAIR_X = 2;
const ESTUFA_PAIR_WIDTH = 1.85;
const MESON_TABLE_CENTER_X = 2.65;
const MESON_TABLE_WIDTH = 4.15;

const STATIONS: { id: StationId; x: number; z: number; label: string; rotationY?: number }[] = [
  { id: "cofreLechuga", x: -5, z: -4, label: "Cofre de lechuga" },
  { id: "cofreTomate", x: -3.3, z: -4, label: "Cofre de tomate" },
  { id: "tabla1", x: -1.5, z: -4, label: "Tabla de picar 1" },
  { id: "tabla2", x: -0.5, z: -4, label: "Tabla de picar 2" },
  { id: "estufa1", x: 1.5, z: -4, label: "Estufa 1" },
  { id: "estufa2", x: 2.5, z: -4, label: "Estufa 2" },
  { id: "platos", x: -5, z: 0, label: "Platos" },
  { id: "lavaplatos", x: -3.3, z: 0, label: "Lavaplatos" },
  { id: "basura", x: -1.6, z: 0, label: "Basura" },
  { id: "meson1", x: 1, z: 0, label: "Mesón" },
  { id: "meson2", x: 2.1, z: 0, label: "Mesón" },
  { id: "meson3", x: 3.2, z: 0, label: "Mesón" },
  { id: "meson4", x: 4.3, z: 0, label: "Mesón" },
  { id: "entrega", x: 7, z: 0, label: "Ventana de entrega", rotationY: -Math.PI / 2 },
];

type Obstacle = { x: number; z: number; hw: number; hd: number };

const OBSTACLES: Obstacle[] = [];
// Muro sur
for (let x = -HALF_W + 1; x <= HALF_W - 1; x += 1) {
  OBSTACLES.push({ x, z: HALF_D, hw: 0.46, hd: 0.46 });
}
// Muros oeste y este (con hueco en z=0 para la ventana de entrega)
for (let z = -HALF_D + 1; z <= HALF_D - 1; z += 1) {
  OBSTACLES.push({ x: -HALF_W, z, hw: 0.46, hd: 0.46 });
  if (z !== 0) OBSTACLES.push({ x: HALF_W, z, hw: 0.46, hd: 0.46 });
}
// Cofres
OBSTACLES.push({ x: -5, z: -4, hw: 0.44, hd: 0.44 });
OBSTACLES.push({ x: -3.3, z: -4, hw: 0.44, hd: 0.44 });
// Tablas y estufas (bases compartidas)
OBSTACLES.push({ x: TABLA_PAIR_X, z: -4, hw: TABLA_PAIR_WIDTH / 2, hd: 0.44 });
OBSTACLES.push({ x: ESTUFA_PAIR_X, z: -4, hw: ESTUFA_PAIR_WIDTH / 2, hd: 0.44 });
// Fila intermedia
OBSTACLES.push({ x: -5, z: 0, hw: 0.44, hd: 0.44 });
OBSTACLES.push({ x: -3.3, z: 0, hw: 0.44, hd: 0.44 });
OBSTACLES.push({ x: -1.6, z: 0, hw: 0.44, hd: 0.44 });
// Mesón
OBSTACLES.push({ x: MESON_TABLE_CENTER_X, z: 0, hw: MESON_TABLE_WIDTH / 2, hd: 0.44 });
// Entrega
OBSTACLES.push({ x: 7, z: 0, hw: 0.46, hd: 0.46 });

function collides(x: number, z: number) {
  for (const o of OBSTACLES) {
    const closestX = Math.max(o.x - o.hw, Math.min(x, o.x + o.hw));
    const closestZ = Math.max(o.z - o.hd, Math.min(z, o.z + o.hd));
    const dx = x - closestX;
    const dz = z - closestZ;
    if (dx * dx + dz * dz < PLAYER_RADIUS * PLAYER_RADIUS) return true;
  }
  return false;
}

function KitchenFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[HALF_W * 2 + 1, HALF_D * 2 + 1]} />
      <meshStandardMaterial color="#e4c9a0" />
    </mesh>
  );
}

function BorderCounter({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={[position[0], 0.35, position[2]]} castShadow receiveShadow>
      <boxGeometry args={[0.9, 0.7, 0.9]} />
      <meshStandardMaterial color="#8a5a3b" />
    </mesh>
  );
}

function KitchenBorder() {
  const counters: [number, number, number][] = [];
  for (let x = -HALF_W + 1; x <= HALF_W - 1; x += 1) {
    counters.push([x, 0, HALF_D]);
  }
  for (let z = -HALF_D + 1; z <= HALF_D - 1; z += 1) {
    counters.push([-HALF_W, 0, z]);
    if (z !== 0) counters.push([HALF_W, 0, z]); // hueco en el muro este para la ventana de entrega
  }
  return (
    <>
      {counters.map((p, i) => (
        <BorderCounter key={i} position={p} />
      ))}
    </>
  );
}

function getTargetStation(pos: [number, number, number], facing: number) {
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

export function KitchenScene() {
  const gameRef = useRef<GameState>(initialGameState());
  const positionRef = useRef<[number, number, number]>([0, 0, 3.5]);
  const facingRef = useRef(0);
  const [snapshot, setSnapshot] = useState<RenderSnapshot>({
    position: [0, 0, 3.5],
    facing: 0,
    carrying: null,
    boards: { tabla1: null, tabla2: null },
    stoves: {
      estufa1: { potPresent: true, content: null },
      estufa2: { potPresent: true, content: null },
    },
    mesonSlots: { meson1: null, meson2: null, meson3: null, meson4: null },
    cleanPlates: 3,
    dirtyPlates: 0,
    washProgress: 0,
    chopProgress: 0,
    chopTargetId: null,
    score: 0,
    orderSecondsLeft: ORDER_SECONDS,
    message: null,
    targetLabel: null,
  });
  const keysDown = useRef<Set<string>>(new Set());
  const spaceHeldRef = useRef(false);
  const interactRequestedRef = useRef(false);
  const lastTimeRef = useRef<number | null>(null);
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showMessage(text: string) {
    gameRef.current.message = text;
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      gameRef.current.message = null;
    }, 1600);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (KEY_TO_DIR[e.key]) {
        keysDown.current.add(e.key);
        e.preventDefault();
      }
      if (e.key === " " || e.key === "Spacebar") {
        if (!e.repeat) interactRequestedRef.current = true;
        spaceHeldRef.current = true;
        e.preventDefault();
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      keysDown.current.delete(e.key);
      if (e.key === " " || e.key === "Spacebar") spaceHeldRef.current = false;
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    let raf: number;

    function handleTabla(id: TablaId) {
      const g = gameRef.current;
      const board = g.boards[id];
      if (board && board.chopped) {
        if (g.carrying === null) {
          g.carrying = { kind: "ingrediente", ingrediente: board.ingredient, chopped: true };
          g.boards[id] = null;
        } else if (g.carrying.kind === "plato" && board.ingredient === "lechuga" && !g.carrying.contenido.includes("lechuga")) {
          g.carrying.contenido.push("lechuga");
          g.boards[id] = null;
        } else {
          showMessage("Tienes las manos ocupadas.");
        }
      } else if (board === null && g.carrying?.kind === "ingrediente") {
        g.boards[id] = { ingredient: g.carrying.ingrediente, chopped: g.carrying.chopped };
        g.carrying = null;
      }
    }

    function handleEstufa(id: EstufaId) {
      const g = gameRef.current;
      const slot = g.stoves[id];
      if (slot.potPresent) {
        if (slot.content === null) {
          if (g.carrying?.kind === "ingrediente" && g.carrying.ingrediente === "tomate" && g.carrying.chopped) {
            slot.content = { ingredient: "tomate", progress: 0, state: "cocinando" };
            g.carrying = null;
          } else if (g.carrying === null) {
            g.carrying = { kind: "olla", content: null };
            slot.potPresent = false;
          } else {
            showMessage("Tienes las manos ocupadas.");
          }
        } else if (g.carrying === null) {
          g.carrying = { kind: "olla", content: slot.content };
          slot.potPresent = false;
          slot.content = null;
        } else {
          showMessage("Tienes las manos ocupadas.");
        }
      } else if (g.carrying?.kind === "olla") {
        slot.potPresent = true;
        slot.content = g.carrying.content;
        g.carrying = null;
      } else if (g.carrying !== null) {
        showMessage("Aquí no hay una olla.");
      }
    }

    function handleMeson(id: MesonId) {
      const g = gameRef.current;
      const slot = g.mesonSlots[id];
      if (slot === null) {
        if (g.carrying !== null) {
          g.mesonSlots[id] = g.carrying;
          g.carrying = null;
        }
        return;
      }
      if (g.carrying === null) {
        g.carrying = slot;
        g.mesonSlots[id] = null;
        return;
      }
      if (
        g.carrying.kind === "olla" &&
        g.carrying.content?.state === "listo" &&
        slot.kind === "plato" &&
        !slot.contenido.includes("salsa")
      ) {
        slot.contenido.push("salsa");
        g.carrying = { kind: "olla", content: null };
        return;
      }
      if (
        g.carrying.kind === "ingrediente" &&
        g.carrying.ingrediente === "lechuga" &&
        g.carrying.chopped &&
        slot.kind === "plato" &&
        !slot.contenido.includes("lechuga")
      ) {
        slot.contenido.push("lechuga");
        g.carrying = null;
        return;
      }
      showMessage("Tienes las manos ocupadas.");
    }

    function handleInteract(stationId: StationId) {
      const g = gameRef.current;

      if (stationId === "cofreLechuga" || stationId === "cofreTomate") {
        if (g.carrying === null) {
          g.carrying = {
            kind: "ingrediente",
            ingrediente: stationId === "cofreLechuga" ? "lechuga" : "tomate",
            chopped: false,
          };
        }
        return;
      }

      if ((TABLA_IDS as readonly string[]).includes(stationId)) {
        handleTabla(stationId as TablaId);
        return;
      }

      if ((ESTUFA_IDS as readonly string[]).includes(stationId)) {
        handleEstufa(stationId as EstufaId);
        return;
      }

      if ((MESON_IDS as readonly string[]).includes(stationId)) {
        handleMeson(stationId as MesonId);
        return;
      }

      if (stationId === "platos") {
        if (g.carrying === null && g.cleanPlates > 0) {
          g.carrying = { kind: "plato", contenido: [] };
          g.cleanPlates -= 1;
        } else if (g.carrying === null) {
          showMessage("No quedan platos limpios.");
        }
        return;
      }

      if (stationId === "entrega") {
        if (g.carrying?.kind === "plato") {
          if (plateMatchesRecipe(g.carrying.contenido)) {
            g.score += 100;
            g.dirtyPlates += 1;
            g.carrying = null;
            g.orderSecondsLeft = ORDER_SECONDS;
            showMessage("¡Entregado! +100");
          } else {
            showMessage("Ese plato no es lo que piden.");
          }
        }
        return;
      }

      if (stationId === "basura") {
        if (g.carrying?.kind === "olla") {
          if (g.carrying.content !== null) {
            g.carrying = { kind: "olla", content: null };
            showMessage("Olla vacía otra vez.");
          }
          return;
        }
        if (g.carrying !== null) {
          if (g.carrying.kind === "plato") g.dirtyPlates += 1;
          g.carrying = null;
        }
        return;
      }
    }

    function tick(time: number) {
      const last = lastTimeRef.current;
      lastTimeRef.current = time;
      const dt = last ? Math.min((time - last) / 1000, 0.05) : 0;
      const g = gameRef.current;

      // Movimiento con colisión contra los elementos de la cocina
      let dx = 0;
      let dz = 0;
      for (const key of keysDown.current) {
        const dir = KEY_TO_DIR[key];
        if (!dir) continue;
        dx += dir[0];
        dz += dir[1];
      }
      if (dx !== 0 || dz !== 0) {
        const len = Math.hypot(dx, dz);
        dx /= len;
        dz /= len;
        const prev = positionRef.current;
        let nx = Math.min(HALF_W - 0.9, Math.max(-HALF_W + 0.9, prev[0] + dx * MOVE_SPEED * dt));
        let nz = Math.min(HALF_D - 0.9, Math.max(-HALF_D + 0.9, prev[2] + dz * MOVE_SPEED * dt));
        if (collides(nx, prev[2])) nx = prev[0];
        if (collides(nx, nz)) nz = prev[2];
        positionRef.current = [nx, 0, nz];
        facingRef.current = Math.atan2(dx, dz);
      }

      const target = getTargetStation(positionRef.current, facingRef.current);

      // Interacción puntual (tecla recién presionada)
      if (interactRequestedRef.current) {
        interactRequestedRef.current = false;
        if (target) handleInteract(target.id);
      }

      // Picar (mantener espacio sobre una tabla con ingrediente crudo)
      const targetBoard =
        target && (TABLA_IDS as readonly string[]).includes(target.id) ? g.boards[target.id as TablaId] : null;
      if (spaceHeldRef.current && targetBoard && !targetBoard.chopped && g.carrying === null) {
        g.chopProgress += dt;
        if (g.chopProgress >= CHOP_TARGET) {
          targetBoard.chopped = true;
          g.chopProgress = 0;
        }
      } else {
        g.chopProgress = 0;
      }

      // Lavar (mantener espacio sobre el lavaplatos con platos sucios pendientes)
      if (spaceHeldRef.current && target?.id === "lavaplatos" && g.dirtyPlates > 0 && g.carrying === null) {
        g.washProgress += dt;
        if (g.washProgress >= WASH_TARGET) {
          g.dirtyPlates -= 1;
          g.cleanPlates += 1;
          g.washProgress = 0;
        }
      } else {
        g.washProgress = 0;
      }

      // Cocción automática de las ollas que están sobre la estufa
      for (const id of ESTUFA_IDS) {
        const slot = g.stoves[id];
        if (slot.potPresent && slot.content && slot.content.state === "cocinando") {
          slot.content.progress += dt;
          if (slot.content.progress >= COOK_BURN_AT) {
            slot.content.state = "quemado";
          } else if (slot.content.progress >= COOK_DONE_AT) {
            slot.content.state = "listo";
          }
        }
      }

      // Temporizador del pedido
      g.orderSecondsLeft -= dt;
      if (g.orderSecondsLeft <= 0) {
        g.orderSecondsLeft = ORDER_SECONDS;
        showMessage("¡Pedido vencido! Uno nuevo empieza.");
      }

      setSnapshot({
        position: positionRef.current,
        facing: facingRef.current,
        carrying: g.carrying,
        boards: { ...g.boards },
        stoves: { estufa1: { ...g.stoves.estufa1 }, estufa2: { ...g.stoves.estufa2 } },
        mesonSlots: { ...g.mesonSlots },
        cleanPlates: g.cleanPlates,
        dirtyPlates: g.dirtyPlates,
        washProgress: g.washProgress,
        chopProgress: g.chopProgress,
        chopTargetId:
          g.chopProgress > 0 && target && (TABLA_IDS as readonly string[]).includes(target.id) ? (target.id as TablaId) : null,
        score: g.score,
        orderSecondsLeft: g.orderSecondsLeft,
        message: g.message,
        targetLabel: target?.label ?? null,
      });
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const cameraPosition = useMemo<[number, number, number]>(() => [0, 11.5, 10.5], []);

  const mesonSlotsForTable = MESON_IDS.map((id) => {
    const station = STATIONS.find((s) => s.id === id)!;
    return { offsetX: station.x - MESON_TABLE_CENTER_X, item: snapshot.mesonSlots[id] };
  });

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-black">
      <Canvas shadows camera={{ position: cameraPosition, fov: 38 }}>
        <color attach="background" args={["#1b1330"]} />
        <FixedOverheadCamera />
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 10, 4]} intensity={1.1} castShadow />
        <group>
          <KitchenFloor />
          <KitchenBorder />
          <LettuceCrate position={[-5, -4]} />
          <TomatoCrate position={[-3.3, -4]} />
          <PairedBase x={TABLA_PAIR_X} z={-4} width={TABLA_PAIR_WIDTH} />
          <ChoppingBoard
            position={[-1.5, -4]}
            label="Tabla 1"
            item={snapshot.boards.tabla1}
            chopProgress={snapshot.chopTargetId === "tabla1" ? snapshot.chopProgress : 0}
          />
          <ChoppingBoard
            position={[-0.5, -4]}
            label="Tabla 2"
            item={snapshot.boards.tabla2}
            chopProgress={snapshot.chopTargetId === "tabla2" ? snapshot.chopProgress : 0}
          />
          <PairedBase x={ESTUFA_PAIR_X} z={-4} width={ESTUFA_PAIR_WIDTH} />
          <Stove position={[1.5, -4]} label="Estufa 1" slot={snapshot.stoves.estufa1} />
          <Stove position={[2.5, -4]} label="Estufa 2" slot={snapshot.stoves.estufa2} />
          <PlateStack position={[-5, 0]} cleanPlates={snapshot.cleanPlates} />
          <Sink position={[-3.3, 0]} dirtyPlates={snapshot.dirtyPlates} washProgress={snapshot.washProgress} />
          <TrashBin position={[-1.6, 0]} />
          <AssemblyTable position={[MESON_TABLE_CENTER_X, 0]} width={MESON_TABLE_WIDTH} slots={mesonSlotsForTable} />
          <DeliveryWindow position={[7, 0]} rotationY={-Math.PI / 2} />
          <ChefCharacter color="#ef4444" position={snapshot.position} facing={snapshot.facing} />
          <CarriedItem carrying={snapshot.carrying} position={snapshot.position} facing={snapshot.facing} />
        </group>
      </Canvas>
      <KitchenHud
        score={snapshot.score}
        orderSecondsLeft={snapshot.orderSecondsLeft}
        carrying={snapshot.carrying}
        targetLabel={snapshot.targetLabel}
        message={snapshot.message}
      />
    </div>
  );
}

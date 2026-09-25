"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ChefCharacter } from "@/components/cocina-loca/chef-character";
import { CarriedItem } from "@/components/cocina-loca/carried-item";
import { KitchenHud } from "@/components/cocina-loca/kitchen-hud";
import {
  AssemblyCounter,
  ChoppingBoard,
  DeliveryWindow,
  LettuceCrate,
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
  ORDER_SECONDS,
  WASH_TARGET,
  initialGameState,
  plateMatchesRecipe,
  type Carrying,
  type GameState,
  type StationId,
} from "@/components/cocina-loca/game-types";

type RenderSnapshot = {
  position: [number, number, number];
  facing: number;
  carrying: Carrying;
  board: GameState["board"];
  stove: GameState["stove"];
  mesonSlot: GameState["mesonSlot"];
  cleanPlates: number;
  dirtyPlates: number;
  washProgress: number;
  chopProgress: number;
  score: number;
  orderSecondsLeft: number;
  message: string | null;
  targetLabel: string | null;
};

function FixedOverheadCamera() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

const MOVE_SPEED = 3.2; // unidades por segundo
const HALF_W = 4.5;
const HALF_D = 3.5;
const REACH_DIST = 0.95;
const REACH_RADIUS = 0.62;

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

const STATIONS: { id: StationId; x: number; z: number; label: string }[] = [
  { id: "cofreLechuga", x: -4, z: -1.8, label: "Cofre de lechuga" },
  { id: "cofreTomate", x: -3, z: -1.8, label: "Cofre de tomate" },
  { id: "tabla", x: -2, z: -1.8, label: "Tabla de picar" },
  { id: "meson", x: -1, z: -1.8, label: "Mesón" },
  { id: "estufa", x: 0, z: -1.8, label: "Estufa" },
  { id: "platos", x: 1, z: -1.8, label: "Platos" },
  { id: "entrega", x: 2, z: -1.8, label: "Ventana de entrega" },
  { id: "lavaplatos", x: 3, z: -1.8, label: "Lavaplatos" },
  { id: "basura", x: 4, z: -1.8, label: "Basura" },
];

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
  for (let x = -HALF_W + 0.5; x <= HALF_W - 0.5; x += 1) {
    counters.push([x, 0, HALF_D]);
  }
  for (let z = -HALF_D + 1; z <= HALF_D - 1; z += 1) {
    counters.push([-HALF_W, 0, z]);
    counters.push([HALF_W, 0, z]);
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
  const positionRef = useRef<[number, number, number]>([0, 0, 1.5]);
  const facingRef = useRef(0);
  const [snapshot, setSnapshot] = useState<RenderSnapshot>({
    position: [0, 0, 1.5],
    facing: 0,
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

      if (stationId === "tabla") {
        if (g.board && g.board.chopped) {
          if (g.carrying === null) {
            g.carrying = { kind: "ingrediente", ingrediente: g.board.ingredient, chopped: true };
            g.board = null;
          } else if (g.carrying.kind === "plato" && g.board.ingredient === "lechuga" && !g.carrying.contenido.includes("lechuga")) {
            g.carrying.contenido.push("lechuga");
            g.board = null;
          } else {
            showMessage("Tienes las manos ocupadas.");
          }
        } else if (g.board === null && g.carrying?.kind === "ingrediente") {
          g.board = { ingredient: g.carrying.ingrediente, chopped: g.carrying.chopped };
          g.carrying = null;
        }
        return;
      }

      if (stationId === "meson") {
        if (g.mesonSlot === null) {
          if (g.carrying?.kind === "plato") {
            g.mesonSlot = { contenido: g.carrying.contenido };
            g.carrying = null;
          } else if (g.carrying !== null) {
            showMessage("El mesón solo guarda platos.");
          }
        } else if (g.carrying === null) {
          g.carrying = { kind: "plato", contenido: g.mesonSlot.contenido };
          g.mesonSlot = null;
        } else {
          showMessage("Tienes las manos ocupadas.");
        }
        return;
      }

      if (stationId === "estufa") {
        if (g.stove === null) {
          if (g.carrying?.kind === "ingrediente" && g.carrying.ingrediente === "tomate" && g.carrying.chopped) {
            g.stove = { progress: 0, state: "cocinando" };
            g.carrying = null;
          }
        } else if (g.stove.state === "listo") {
          if (g.carrying === null) {
            g.carrying = { kind: "salsa" };
            g.stove = null;
          } else if (g.carrying.kind === "plato" && !g.carrying.contenido.includes("salsa")) {
            g.carrying.contenido.push("salsa");
            g.stove = null;
          } else {
            showMessage("Tienes las manos ocupadas.");
          }
        } else if (g.stove.state === "quemado" && g.carrying === null) {
          g.carrying = { kind: "quemado" };
          g.stove = null;
        }
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

      // Movimiento
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
        const nx = Math.min(HALF_W - 0.9, Math.max(-HALF_W + 0.9, prev[0] + dx * MOVE_SPEED * dt));
        const nz = Math.min(HALF_D - 0.9, Math.max(-HALF_D + 0.9, prev[2] + dz * MOVE_SPEED * dt));
        positionRef.current = [nx, 0, nz];
        facingRef.current = Math.atan2(dx, dz);
      }

      const target = getTargetStation(positionRef.current, facingRef.current);

      // Interacción puntual (tecla recién presionada)
      if (interactRequestedRef.current) {
        interactRequestedRef.current = false;
        if (target) handleInteract(target.id);
      }

      // Picar (mantener espacio sobre la tabla con ingrediente crudo)
      if (spaceHeldRef.current && target?.id === "tabla" && g.board && !g.board.chopped && g.carrying === null) {
        g.chopProgress += dt;
        if (g.chopProgress >= CHOP_TARGET) {
          g.board.chopped = true;
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

      // Cocción automática de la estufa
      if (g.stove && g.stove.state === "cocinando") {
        g.stove.progress += dt;
        if (g.stove.progress >= COOK_BURN_AT) {
          g.stove.state = "quemado";
        } else if (g.stove.progress >= COOK_DONE_AT) {
          g.stove.state = "listo";
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
        board: g.board,
        stove: g.stove,
        mesonSlot: g.mesonSlot,
        cleanPlates: g.cleanPlates,
        dirtyPlates: g.dirtyPlates,
        washProgress: g.washProgress,
        chopProgress: g.chopProgress,
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

  const cameraPosition = useMemo<[number, number, number]>(() => [0, 7.5, 7], []);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-black">
      <Canvas shadows camera={{ position: cameraPosition, fov: 40 }}>
        <color attach="background" args={["#1b1330"]} />
        <FixedOverheadCamera />
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 8, 4]} intensity={1.1} castShadow />
        <group>
          <KitchenFloor />
          <KitchenBorder />
          <LettuceCrate />
          <TomatoCrate />
          <ChoppingBoard item={snapshot.board} chopProgress={snapshot.chopProgress} />
          <AssemblyCounter slot={snapshot.mesonSlot} />
          <Stove item={snapshot.stove} />
          <PlateStack cleanPlates={snapshot.cleanPlates} />
          <DeliveryWindow />
          <Sink dirtyPlates={snapshot.dirtyPlates} washProgress={snapshot.washProgress} />
          <TrashBin />
          <ChefCharacter color="#ef4444" position={snapshot.position} facing={snapshot.facing} />
          <CarriedItem carrying={snapshot.carrying} position={snapshot.position} />
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

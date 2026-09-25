"use client";

import { useEffect, useMemo, useState } from "react";
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
import { getConnectedCocinaSocket } from "@/lib/cocina-socket-client";
import type { KitchenStatePayload } from "@/lib/cocina-events";
import {
  ESTUFA_PAIR_WIDTH,
  ESTUFA_PAIR_X,
  MESON_IDS,
  MESON_TABLE_CENTER_X,
  MESON_TABLE_WIDTH,
  ORDER_SECONDS,
  STATIONS,
  TABLA_PAIR_WIDTH,
  TABLA_PAIR_X,
  getTargetStation,
} from "@/lib/kitchen-sim";

function FixedOverheadCamera() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

const HALF_W = 7;
const HALF_D = 5;

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
  for (let x = -HALF_W + 1; x <= HALF_W - 1; x += 1) counters.push([x, 0, HALF_D]);
  for (let z = -HALF_D + 1; z <= HALF_D - 1; z += 1) {
    counters.push([-HALF_W, 0, z]);
    if (z !== 0) counters.push([HALF_W, 0, z]);
  }
  return (
    <>
      {counters.map((p, i) => (
        <BorderCounter key={i} position={p} />
      ))}
    </>
  );
}

const emptyState: KitchenStatePayload = {
  players: {},
  boards: { tabla1: null, tabla2: null },
  stoves: { estufa1: { potPresent: true, content: null }, estufa2: { potPresent: true, content: null } },
  mesonSlots: { meson1: null, meson2: null, meson3: null, meson4: null },
  cleanPlates: 3,
  dirtyPlates: 0,
  washProgress: 0,
  orderSecondsLeft: ORDER_SECONDS,
};

export function NetworkedKitchenScene({ code, myUserId, score }: { code: string; myUserId: string; score: number }) {
  const [state, setState] = useState<KitchenStatePayload>(emptyState);

  useEffect(() => {
    const socket = getConnectedCocinaSocket();
    if (!socket) return;
    const onState = (payload: KitchenStatePayload) => setState(payload);
    socket.on("kitchen:state", onState);
    return () => {
      socket.off("kitchen:state", onState);
    };
  }, [code]);

  useEffect(() => {
    const keysDown = new Set<string>();
    let lastDx = 0;
    let lastDz = 0;
    let spaceHeld = false;

    function socket() {
      return getConnectedCocinaSocket();
    }

    function sendMoveIfChanged() {
      let dx = 0;
      let dz = 0;
      for (const key of keysDown) {
        const dir = KEY_TO_DIR[key];
        if (!dir) continue;
        dx += dir[0];
        dz += dir[1];
      }
      if (dx !== lastDx || dz !== lastDz) {
        lastDx = dx;
        lastDz = dz;
        socket()?.emit("kitchen:move", { code, dx, dz });
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (KEY_TO_DIR[e.key]) {
        keysDown.add(e.key);
        e.preventDefault();
        sendMoveIfChanged();
      }
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        if (!e.repeat) socket()?.emit("kitchen:interact", { code });
        if (!spaceHeld) {
          spaceHeld = true;
          socket()?.emit("kitchen:space", { code, held: true });
        }
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      keysDown.delete(e.key);
      sendMoveIfChanged();
      if (e.key === " " || e.key === "Spacebar") {
        spaceHeld = false;
        socket()?.emit("kitchen:space", { code, held: false });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [code]);

  const cameraPosition = useMemo<[number, number, number]>(() => [0, 11.5, 10.5], []);

  const mesonSlotsForTable = MESON_IDS.map((id) => {
    const station = STATIONS.find((s) => s.id === id)!;
    return { offsetX: station.x - MESON_TABLE_CENTER_X, item: state.mesonSlots[id] };
  });

  const me = state.players[myUserId];
  const targetLabel = me ? (getTargetStation(me.position, me.facing)?.label ?? null) : null;

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
          <ChoppingBoard position={[-1.5, -4]} label="Tabla 1" item={state.boards.tabla1} chopProgress={state.boards.tabla1?.chopProgress ?? 0} />
          <ChoppingBoard position={[-0.5, -4]} label="Tabla 2" item={state.boards.tabla2} chopProgress={state.boards.tabla2?.chopProgress ?? 0} />
          <PairedBase x={ESTUFA_PAIR_X} z={-4} width={ESTUFA_PAIR_WIDTH} />
          <Stove position={[1.5, -4]} label="Estufa 1" slot={state.stoves.estufa1} />
          <Stove position={[2.5, -4]} label="Estufa 2" slot={state.stoves.estufa2} />
          <PlateStack position={[-5, 0]} cleanPlates={state.cleanPlates} />
          <Sink position={[-3.3, 0]} dirtyPlates={state.dirtyPlates} washProgress={state.washProgress} />
          <TrashBin position={[-1.6, 0]} />
          <AssemblyTable position={[MESON_TABLE_CENTER_X, 0]} width={MESON_TABLE_WIDTH} slots={mesonSlotsForTable} />
          <DeliveryWindow position={[7, 0]} rotationY={-Math.PI / 2} />
          {Object.entries(state.players).map(([userId, player]) => (
            <group key={userId}>
              {userId === myUserId && (
                <mesh position={[player.position[0], 0.02, player.position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.32, 0.42, 32]} />
                  <meshBasicMaterial color={player.color} />
                </mesh>
              )}
              <ChefCharacter color={player.color} position={player.position} facing={player.facing} />
              <CarriedItem carrying={player.carrying} position={player.position} facing={player.facing} />
            </group>
          ))}
        </group>
      </Canvas>
      <KitchenHud
        score={score}
        orderSecondsLeft={state.orderSecondsLeft}
        carrying={me?.carrying ?? null}
        targetLabel={targetLabel}
        message={me?.message ?? null}
      />
    </div>
  );
}

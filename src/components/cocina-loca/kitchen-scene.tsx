"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ChefCharacter } from "@/components/cocina-loca/chef-character";

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

function Counter({ position, color = "#8a5a3b" }: { position: [number, number, number]; color?: string }) {
  return (
    <mesh position={[position[0], 0.35, position[2]]} castShadow receiveShadow>
      <boxGeometry args={[0.9, 0.7, 0.9]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function KitchenLayout() {
  const counters: [number, number, number][] = [];
  for (let x = -HALF_W + 0.5; x <= HALF_W - 0.5; x += 1) {
    counters.push([x, 0, -HALF_D]);
    counters.push([x, 0, HALF_D]);
  }
  for (let z = -HALF_D + 1; z <= HALF_D - 1; z += 1) {
    counters.push([-HALF_W, 0, z]);
    counters.push([HALF_W, 0, z]);
  }
  return (
    <>
      {counters.map((p, i) => (
        <Counter key={i} position={p} />
      ))}
      {/* Estación de picar */}
      <Counter position={[-2, 0, -1.5]} color="#c7823f" />
      {/* Estufa */}
      <Counter position={[0, 0, -1.5]} color="#5a5a5a" />
      {/* Mesón de entrega */}
      <Counter position={[2, 0, -1.5]} color="#3f7d4d" />
    </>
  );
}

export function KitchenScene() {
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 1.5]);
  const [facing, setFacing] = useState(0);
  const keysDown = useRef<Set<string>>(new Set());
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (KEY_TO_DIR[e.key]) {
        keysDown.current.add(e.key);
        e.preventDefault();
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      keysDown.current.delete(e.key);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    let raf: number;

    function tick(time: number) {
      const last = lastTimeRef.current;
      lastTimeRef.current = time;
      const dt = last ? Math.min((time - last) / 1000, 0.05) : 0;

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
        setPosition((prev) => {
          const nx = Math.min(HALF_W - 0.9, Math.max(-HALF_W + 0.9, prev[0] + dx * MOVE_SPEED * dt));
          const nz = Math.min(HALF_D - 0.9, Math.max(-HALF_D + 0.9, prev[2] + dz * MOVE_SPEED * dt));
          return [nx, 0, nz];
        });
        setFacing(Math.atan2(dx, dz));
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const cameraPosition = useMemo<[number, number, number]>(() => [0, 7.5, 7], []);

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border bg-black">
      <Canvas shadows camera={{ position: cameraPosition, fov: 40 }}>
        <color attach="background" args={["#1b1330"]} />
        <FixedOverheadCamera />
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 8, 4]} intensity={1.1} castShadow />
        <group>
          <KitchenFloor />
          <KitchenLayout />
          <ChefCharacter color="#ef4444" position={position} facing={facing} />
        </group>
      </Canvas>
    </div>
  );
}

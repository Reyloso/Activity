"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { Group } from "three";

const MODEL_PATH = "/models/characters/chef.glb";
useGLTF.preload(MODEL_PATH);

const CHARACTER_SCALE = 1.6;
/** Debajo de esta velocidad (unidades/seg) el personaje se considera quieto. */
const WALK_SPEED_THRESHOLD = 0.15;

export function ChefCharacter({
  color,
  position,
  facing,
}: {
  color: string;
  position: [number, number, number];
  facing: number;
}) {
  const groupRef = useRef<Group>(null);
  const prevPosRef = useRef(position);
  const currentActionRef = useRef<"idle" | "walk">("idle");

  const { scene, animations } = useGLTF(MODEL_PATH);
  // Cada personaje necesita su propia copia del esqueleto (no solo de la malla) para
  // poder animarse de forma independiente del resto de jugadores.
  const characterScene = useMemo(() => cloneSkeleton(scene), [scene]);
  const { actions } = useAnimations(animations, characterScene);

  useEffect(() => {
    characterScene.traverse((child) => {
      if ("isMesh" in child && child.isMesh) child.castShadow = true;
    });
  }, [characterScene]);

  useEffect(() => {
    actions.idle?.reset().fadeIn(0.2).play();
    return () => {
      actions.idle?.fadeOut(0.2);
    };
  }, [actions]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.set(position[0], position[1], position[2]);
    // Interpolación corta hacia el ángulo de orientación, para que el giro no sea instantáneo.
    const current = groupRef.current.rotation.y;
    let diff = facing - current;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    groupRef.current.rotation.y = current + diff * 0.3;

    const prev = prevPosRef.current;
    const dx = position[0] - prev[0];
    const dz = position[2] - prev[2];
    const speed = delta > 0 ? Math.hypot(dx, dz) / delta : 0;
    prevPosRef.current = position;

    const shouldWalk = speed > WALK_SPEED_THRESHOLD;
    const nextAction = shouldWalk ? "walk" : "idle";
    if (nextAction !== currentActionRef.current) {
      actions[currentActionRef.current]?.fadeOut(0.15);
      actions[nextAction]?.reset().fadeIn(0.15).play();
      currentActionRef.current = nextAction;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={characterScene} scale={CHARACTER_SCALE} />
      {/* Marcador de color de equipo, flotando sobre la cabeza (no se tiñe el modelo real). */}
      <mesh position={[0, 1.16, 0]} rotation={[Math.PI / 4, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.12, 0.12, 0.12]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

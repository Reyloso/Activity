"use client";

import { useMemo } from "react";
import { Clone, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { WALL_CORNER_MODEL, WALL_MODEL } from "@/components/cocina-loca/kitchen-models";

/** Textura de baldosa a cuadros generada en memoria (sin depender de un archivo externo). */
function useCheckerTexture(repeatX: number, repeatZ: number) {
  return useMemo(() => {
    const data = new Uint8Array([
      228, 201, 160, 255, 201, 147, 90, 255, 201, 147, 90, 255, 228, 201, 160, 255,
    ]);
    const texture = new THREE.DataTexture(data, 2, 2, THREE.RGBAFormat);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatZ);
    texture.needsUpdate = true;
    return texture;
  }, [repeatX, repeatZ]);
}

export function KitchenFloor({ width, depth }: { width: number; depth: number }) {
  const texture = useCheckerTexture(width, depth);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export function KitchenBorder({ halfW, halfD }: { halfW: number; halfD: number }) {
  const { scene: wallScene } = useGLTF(WALL_MODEL);
  const { scene: cornerScene } = useGLTF(WALL_CORNER_MODEL);

  const segments: { position: [number, number, number]; rotationY: number }[] = [];
  for (let x = -halfW + 1; x <= halfW - 1; x += 1) {
    segments.push({ position: [x - 0.5, 0, halfD], rotationY: 0 });
  }
  for (let z = -halfD + 1; z <= halfD - 1; z += 1) {
    segments.push({ position: [-halfW, 0, z + 0.5], rotationY: Math.PI / 2 });
    if (z !== 0) segments.push({ position: [halfW, 0, z + 0.5], rotationY: Math.PI / 2 });
  }
  const corners: { position: [number, number, number]; rotationY: number }[] = [
    { position: [-halfW, 0, halfD], rotationY: 0 },
    { position: [halfW, 0, halfD], rotationY: -Math.PI / 2 },
  ];

  return (
    <group>
      {segments.map((s, i) => (
        <Clone key={i} object={wallScene} position={s.position} rotation={[0, s.rotationY, 0]} castShadow receiveShadow />
      ))}
      {corners.map((c, i) => (
        <Clone key={i} object={cornerScene} position={c.position} rotation={[0, c.rotationY, 0]} castShadow receiveShadow />
      ))}
    </group>
  );
}

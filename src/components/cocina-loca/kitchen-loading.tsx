"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import type { Mesh } from "three";

/**
 * Indicador de carga mientras se descargan los modelos 3D de la cocina.
 * Vive dentro del <Canvas> (es el fallback de un <Suspense> de R3F), así que se dibuja
 * con elementos de three.js en vez de DOM (evita usar <Html> de drei, que en dev con
 * Fast Refresh puede desmontar su portal a mitad de un render y tirar un error de React).
 */
export function KitchenLoadingFallback() {
  const ringRef = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (ringRef.current) ringRef.current.rotation.z -= delta * 4;
  });
  return (
    <Billboard position={[0, 1.6, 0]}>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.35, 0.45, 32, 1, 0, Math.PI * 1.4]} />
        <meshBasicMaterial color="#ffb300" transparent opacity={0.9} />
      </mesh>
      <Text
        position={[0, -0.85, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        Cargando cocina...
      </Text>
    </Billboard>
  );
}

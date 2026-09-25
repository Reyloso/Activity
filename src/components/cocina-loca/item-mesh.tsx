"use client";

import { useGLTF, Clone } from "@react-three/drei";
import type { Carrying } from "@/components/cocina-loca/game-types";
import { IngredientModel, INGREDIENT_MODEL_PATH } from "@/components/cocina-loca/ingredient-model";

const INGREDIENT_COLOR: Record<string, string> = {
  lechuga: "#4caf50",
  tomate: "#e53935",
  cebolla: "#ba68c8",
  camaron: "#ff8a65",
  pescado: "#4fc3f7",
  carne: "#6d4c41",
};

const PLATE_MODEL_PATH = "/models/food/plate.glb";
const POT_MODEL_PATH = "/models/food/pot-stew.glb";
useGLTF.preload(PLATE_MODEL_PATH);
useGLTF.preload(POT_MODEL_PATH);

const STAIN_SPOTS: [number, number, number][] = [
  [0.12, 0.058, 0.05],
  [-0.15, 0.058, -0.08],
  [0.02, 0.058, -0.16],
  [-0.09, 0.058, 0.15],
];

/** Rastros de comida (manchas cafés) que se dibujan encima de un plato sucio. */
export function PlateStains() {
  return (
    <>
      {STAIN_SPOTS.map((p, i) => (
        <mesh key={i} position={p} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.045 + (i % 2) * 0.015, 10]} />
          <meshStandardMaterial color="#6d4c33" roughness={1} />
        </mesh>
      ))}
    </>
  );
}

export function ItemMesh({ item }: { item: Carrying }) {
  // Los hooks deben llamarse siempre, sin importar `item`, así que se cargan de una vez.
  const { scene: potScene } = useGLTF(POT_MODEL_PATH);
  const { scene: plateScene } = useGLTF(PLATE_MODEL_PATH);

  if (!item) return null;

  if (item.kind === "ingrediente") {
    if (INGREDIENT_MODEL_PATH[item.ingrediente]) {
      return <IngredientModel ingredient={item.ingrediente} position={[0, 0.02, 0]} />;
    }
    return (
      <mesh castShadow>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color={INGREDIENT_COLOR[item.ingrediente]} />
      </mesh>
    );
  }

  if (item.kind === "quemado") {
    return (
      <mesh castShadow>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    );
  }

  if (item.kind === "platoSucio") {
    return (
      <group>
        <Clone object={plateScene} scale={0.62} castShadow />
        <PlateStains />
      </group>
    );
  }

  if (item.kind === "olla") {
    const stateColor =
      item.content === null
        ? null
        : item.content.state === "quemado"
          ? "#2b2b2b"
          : item.content.state === "listo"
            ? "#ff7043"
            : "#a1887f";
    return (
      <group>
        <Clone object={potScene} scale={0.85} castShadow />
        {stateColor && (
          <mesh position={[0, 0.365, 0]}>
            <sphereGeometry args={[0.17, 12, 12]} />
            <meshStandardMaterial color={stateColor} />
          </mesh>
        )}
      </group>
    );
  }

  return (
    <group>
      <Clone object={plateScene} scale={0.62} castShadow />
      {item.contenido.map((content, i) => (
        <mesh key={content} position={[(i - 0.5) * 0.18, 0.13, 0]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial color={content === "salsa" ? "#ff7043" : INGREDIENT_COLOR[content]} />
        </mesh>
      ))}
    </group>
  );
}

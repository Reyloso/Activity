"use client";

import { Text } from "@react-three/drei";
import type { BoardItem, MesonSlot, StoveItem } from "@/components/cocina-loca/game-types";

const INGREDIENT_COLOR: Record<string, string> = {
  lechuga: "#4caf50",
  tomate: "#e53935",
};

function StationBase({
  position,
  color,
  label,
}: {
  position: [number, number];
  color: string;
  label: string;
}) {
  return (
    <group position={[position[0], 0, position[1]]}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.7, 0.85]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text position={[0, 0.75, 0.44]} fontSize={0.14} color="#ffffff" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  );
}

function RawIngredient({ ingredient, chopped }: { ingredient: "lechuga" | "tomate"; chopped: boolean }) {
  const color = INGREDIENT_COLOR[ingredient];
  if (!chopped) {
    return (
      <mesh position={[0, 0.78, 0]} castShadow>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  }
  const offsets = [
    [-0.1, -0.1],
    [0.1, -0.08],
    [0, 0.1],
    [0.12, 0.08],
  ];
  return (
    <group position={[0, 0.75, 0]}>
      {offsets.map((o, i) => (
        <mesh key={i} position={[o[0], 0, o[1]]} castShadow>
          <boxGeometry args={[0.09, 0.06, 0.09]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

export function LettuceCrate() {
  return <StationBase position={[-4, -1.8]} color="#2e7d32" label="Lechuga" />;
}

export function TomatoCrate() {
  return <StationBase position={[-3, -1.8]} color="#b71c1c" label="Tomate" />;
}

export function ChoppingBoard({ item, chopProgress }: { item: BoardItem; chopProgress: number }) {
  return (
    <group position={[-2, 0, -1.8]}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.7, 0.85]} />
        <meshStandardMaterial color="#8a5a3b" />
      </mesh>
      <mesh position={[0, 0.71, 0]} receiveShadow>
        <boxGeometry args={[0.6, 0.03, 0.5]} />
        <meshStandardMaterial color="#d7b98a" />
      </mesh>
      <Text position={[0, 0.75, 0.44]} fontSize={0.14} color="#ffffff" anchorX="center" anchorY="middle">
        Tabla
      </Text>
      {item && (
        <group position={[0, 0, 0]}>
          <RawIngredient ingredient={item.ingredient} chopped={item.chopped} />
          {!item.chopped && chopProgress > 0 && (
            <mesh position={[0, 0.95, 0]}>
              <boxGeometry args={[0.5 * Math.min(chopProgress, 1), 0.06, 0.06]} />
              <meshStandardMaterial color="#ffd54f" />
            </mesh>
          )}
        </group>
      )}
    </group>
  );
}

export function AssemblyCounter({ slot }: { slot: MesonSlot }) {
  return (
    <group position={[-1, 0, -1.8]}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.7, 0.85]} />
        <meshStandardMaterial color="#8a5a3b" />
      </mesh>
      <Text position={[0, 0.75, 0.44]} fontSize={0.14} color="#ffffff" anchorX="center" anchorY="middle">
        Mesón
      </Text>
      {slot && (
        <group position={[0, 0.75, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.04, 20]} />
            <meshStandardMaterial color="#f5f5f5" />
          </mesh>
          {slot.contenido.map((item, i) => (
            <mesh key={item} position={[(i - 0.5) * 0.14, 0.08, 0]}>
              <sphereGeometry args={[0.08, 10, 10]} />
              <meshStandardMaterial color={item === "lechuga" ? INGREDIENT_COLOR.lechuga : "#ff7043"} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

export function Stove({ item }: { item: StoveItem }) {
  const color = item?.state === "quemado" ? "#2b2b2b" : item?.state === "listo" ? "#ff7043" : "#6d4c41";
  return (
    <group position={[0, 0, -1.8]}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.7, 0.85]} />
        <meshStandardMaterial color="#5a5a5a" />
      </mesh>
      <mesh position={[0, 0.78, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.3, 0.16, 16]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      <Text position={[0, 0.75, 0.44]} fontSize={0.14} color="#ffffff" anchorX="center" anchorY="middle">
        Estufa
      </Text>
      {item && (
        <>
          <mesh position={[0, 0.9, 0]} castShadow>
            <sphereGeometry args={[0.17, 12, 12]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <Text position={[0, 1.15, 0]} fontSize={0.13} color={item.state === "quemado" ? "#ff5252" : "#ffd54f"} anchorX="center">
            {item.state === "cocinando" ? `${Math.round(item.progress * 100)}%` : item.state === "listo" ? "¡Lista!" : "Quemado"}
          </Text>
        </>
      )}
    </group>
  );
}

export function PlateStack({ cleanPlates }: { cleanPlates: number }) {
  return (
    <group position={[1, 0, -1.8]}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.7, 0.85]} />
        <meshStandardMaterial color="#8a5a3b" />
      </mesh>
      {Array.from({ length: Math.min(cleanPlates, 5) }).map((_, i) => (
        <mesh key={i} position={[0, 0.72 + i * 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.04, 20]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>
      ))}
      <Text position={[0, 1.05, 0]} fontSize={0.14} color="#333333" anchorX="center">
        {cleanPlates}
      </Text>
      <Text position={[0, 0.75, 0.44]} fontSize={0.14} color="#ffffff" anchorX="center" anchorY="middle">
        Platos
      </Text>
    </group>
  );
}

export function DeliveryWindow() {
  return <StationBase position={[2, -1.8]} color="#2e7d32" label="Entrega" />;
}

export function Sink({ dirtyPlates, washProgress }: { dirtyPlates: number; washProgress: number }) {
  return (
    <group position={[3, 0, -1.8]}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.7, 0.85]} />
        <meshStandardMaterial color="#37474f" />
      </mesh>
      <mesh position={[0, 0.73, 0]} receiveShadow>
        <boxGeometry args={[0.6, 0.08, 0.5]} />
        <meshStandardMaterial color="#4fc3f7" />
      </mesh>
      <Text position={[0, 0.75, 0.44]} fontSize={0.14} color="#ffffff" anchorX="center" anchorY="middle">
        Lavaplatos
      </Text>
      {dirtyPlates > 0 && (
        <>
          <Text position={[0, 1.0, 0]} fontSize={0.15} color="#ffb74d" anchorX="center">
            {dirtyPlates} sucio{dirtyPlates > 1 ? "s" : ""}
          </Text>
          {washProgress > 0 && (
            <mesh position={[0, 0.9, 0]}>
              <boxGeometry args={[0.5 * Math.min(washProgress, 1), 0.06, 0.06]} />
              <meshStandardMaterial color="#4fc3f7" />
            </mesh>
          )}
        </>
      )}
    </group>
  );
}

export function TrashBin() {
  return (
    <group position={[4, 0, -1.8]}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.28, 0.6, 16]} />
        <meshStandardMaterial color="#263238" />
      </mesh>
      <Text position={[0, 0.75, 0.44]} fontSize={0.14} color="#ffffff" anchorX="center" anchorY="middle">
        Basura
      </Text>
    </group>
  );
}

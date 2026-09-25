"use client";

import { Text } from "@react-three/drei";
import { ItemMesh } from "@/components/cocina-loca/item-mesh";
import { COOK_DONE_AT, type BoardItem, type Carrying, type StoveSlot } from "@/components/cocina-loca/game-types";

const INGREDIENT_COLOR: Record<string, string> = {
  lechuga: "#4caf50",
  tomate: "#e53935",
};

export function StationBase({
  position,
  color,
  label,
  rotationY = 0,
}: {
  position: [number, number];
  color: string;
  label: string;
  rotationY?: number;
}) {
  return (
    <group position={[position[0], 0, position[1]]} rotation={[0, rotationY, 0]}>
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

export function PairedBase({ x, z, width }: { x: number; z: number; width: number }) {
  return (
    <mesh position={[x, 0.35, z]} castShadow receiveShadow>
      <boxGeometry args={[width, 0.7, 0.85]} />
      <meshStandardMaterial color="#8a5a3b" />
    </mesh>
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

export function LettuceCrate({ position }: { position: [number, number] }) {
  return <StationBase position={position} color="#2e7d32" label="Lechuga" />;
}

export function TomatoCrate({ position }: { position: [number, number] }) {
  return <StationBase position={position} color="#b71c1c" label="Tomate" />;
}

export function ChoppingBoard({
  position,
  label,
  item,
  chopProgress,
}: {
  position: [number, number];
  label: string;
  item: BoardItem;
  chopProgress: number;
}) {
  return (
    <group position={[position[0], 0, position[1]]}>
      <mesh position={[0, 0.71, 0]} receiveShadow>
        <boxGeometry args={[0.6, 0.03, 0.5]} />
        <meshStandardMaterial color="#d7b98a" />
      </mesh>
      <Text position={[0, 0.75, 0.44]} fontSize={0.13} color="#ffffff" anchorX="center" anchorY="middle">
        {label}
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

export function AssemblyTable({
  position,
  width,
  slots,
}: {
  position: [number, number];
  width: number;
  slots: { offsetX: number; item: Carrying }[];
}) {
  return (
    <group position={[position[0], 0, position[1]]}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.7, 0.85]} />
        <meshStandardMaterial color="#a1887f" />
      </mesh>
      <Text position={[0, 0.75, 0.44]} fontSize={0.14} color="#ffffff" anchorX="center" anchorY="middle">
        Mesón
      </Text>
      {slots.map((slot, i) => (
        <group key={i} position={[slot.offsetX, 0.72, 0]}>
          {!slot.item && (
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.2, 0.24, 24]} />
              <meshStandardMaterial color="#efebe9" />
            </mesh>
          )}
          <ItemMesh item={slot.item} />
        </group>
      ))}
    </group>
  );
}

export function Stove({ position, label, slot }: { position: [number, number]; label: string; slot: StoveSlot }) {
  return (
    <group position={[position[0], 0, position[1]]}>
      <mesh position={[0, 0.71, 0]} receiveShadow>
        <cylinderGeometry args={[0.28, 0.3, 0.04, 16]} />
        <meshStandardMaterial color="#3a3a3a" />
      </mesh>
      <Text position={[0, 0.75, 0.44]} fontSize={0.13} color="#ffffff" anchorX="center" anchorY="middle">
        {label}
      </Text>
      {slot.potPresent && (
        <group position={[0, 0.8, 0]}>
          <ItemMesh item={{ kind: "olla", content: slot.content }} />
        </group>
      )}
      {slot.potPresent && slot.content?.state === "cocinando" && (
        <Text position={[0, 1.1, 0]} fontSize={0.13} color="#ffd54f" anchorX="center">
          {Math.min(100, Math.round((slot.content.progress / COOK_DONE_AT) * 100))}%
        </Text>
      )}
      {slot.potPresent && slot.content?.state === "listo" && (
        <Text position={[0, 1.1, 0]} fontSize={0.13} color="#ffd54f" anchorX="center">
          ¡Lista!
        </Text>
      )}
      {slot.potPresent && slot.content?.state === "quemado" && (
        <Text position={[0, 1.1, 0]} fontSize={0.13} color="#ff5252" anchorX="center">
          Quemado
        </Text>
      )}
    </group>
  );
}

export function PlateStack({ position, cleanPlates }: { position: [number, number]; cleanPlates: number }) {
  return (
    <group position={[position[0], 0, position[1]]}>
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

export function DeliveryWindow({ position, rotationY = 0 }: { position: [number, number]; rotationY?: number }) {
  return <StationBase position={position} color="#2e7d32" label="Entrega" rotationY={rotationY} />;
}

export function Sink({
  position,
  dirtyPlates,
  washProgress,
}: {
  position: [number, number];
  dirtyPlates: number;
  washProgress: number;
}) {
  return (
    <group position={[position[0], 0, position[1]]}>
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

export function TrashBin({ position }: { position: [number, number] }) {
  return (
    <group position={[position[0], 0, position[1]]}>
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

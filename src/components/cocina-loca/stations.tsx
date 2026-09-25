"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Clone, Text, useGLTF } from "@react-three/drei";
import type { Group } from "three";
import { ItemMesh, PlateStains } from "@/components/cocina-loca/item-mesh";
import { IngredientModel, INGREDIENT_MODEL_PATH } from "@/components/cocina-loca/ingredient-model";
import {
  CONVEYOR_MODEL,
  CUTTING_BOARD_MODEL,
  KNIFE_MODEL,
  PLATE_MODEL,
  SINK_MODEL,
  STOVE_MODEL,
  STOVE_SINK_MODEL_OFFSET,
  TRASHCAN_MODEL,
} from "@/components/cocina-loca/kitchen-models";
import { COOK_DONE_AT, type BoardItem, type Carrying, type Ingredient, type StoveSlot } from "@/components/cocina-loca/game-types";

const INGREDIENT_COLOR: Record<string, string> = {
  lechuga: "#4caf50",
  tomate: "#e53935",
  cebolla: "#ba68c8",
  camaron: "#ff8a65",
  pescado: "#4fc3f7",
  carne: "#6d4c41",
};

function StationLabel({ label, y = 0.95 }: { label: string; y?: number }) {
  return (
    <Billboard position={[0, y, 0]}>
      <Text fontSize={0.14} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.008} outlineColor="#000000">
        {label}
      </Text>
    </Billboard>
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

function RawIngredient({
  ingredient,
  chopped,
}: {
  ingredient: "lechuga" | "tomate" | "cebolla" | "camaron" | "pescado" | "carne";
  chopped: boolean;
}) {
  const color = INGREDIENT_COLOR[ingredient];
  if (!chopped) {
    if (INGREDIENT_MODEL_PATH[ingredient]) {
      return <IngredientModel ingredient={ingredient} position={[0, 0.75, 0]} />;
    }
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

const CRATE_SIZE = 0.75;

function WoodCrate() {
  const half = CRATE_SIZE / 2;
  const plankColor = "#a9713f";
  const trimColor = "#6b4423";
  const corners: [number, number][] = [
    [-half, -half],
    [half, -half],
    [-half, half],
    [half, half],
  ];
  return (
    <group>
      <mesh position={[0, half, 0]} castShadow receiveShadow>
        <boxGeometry args={[CRATE_SIZE, CRATE_SIZE, CRATE_SIZE]} />
        <meshStandardMaterial color={plankColor} />
      </mesh>
      {corners.map(([x, z], i) => (
        <mesh key={i} position={[x, half, z]} castShadow>
          <boxGeometry args={[0.05, CRATE_SIZE + 0.02, 0.05]} />
          <meshStandardMaterial color={trimColor} />
        </mesh>
      ))}
      <mesh position={[0, CRATE_SIZE, 0]} castShadow>
        <boxGeometry args={[CRATE_SIZE + 0.03, 0.05, CRATE_SIZE + 0.03]} />
        <meshStandardMaterial color={trimColor} />
      </mesh>
      <mesh position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[CRATE_SIZE + 0.03, 0.05, CRATE_SIZE + 0.03]} />
        <meshStandardMaterial color={trimColor} />
      </mesh>
    </group>
  );
}

function IngredientCrate({
  position,
  ingredient,
  label,
  rotationY = 0,
}: {
  position: [number, number];
  ingredient: Ingredient;
  label: string;
  rotationY?: number;
}) {
  const hasModel = Boolean(INGREDIENT_MODEL_PATH[ingredient]);
  return (
    <group position={[position[0], 0, position[1]]} rotation={[0, rotationY, 0]}>
      <WoodCrate />
      {hasModel ? (
        <IngredientModel ingredient={ingredient} position={[0, CRATE_SIZE, 0]} />
      ) : (
        <mesh position={[0, CRATE_SIZE, 0]} castShadow>
          <sphereGeometry args={[0.14, 12, 12]} />
          <meshStandardMaterial color={INGREDIENT_COLOR[ingredient]} />
        </mesh>
      )}
      <StationLabel label={label} y={CRATE_SIZE + 0.55} />
    </group>
  );
}

export function LettuceCrate({ position }: { position: [number, number] }) {
  return <IngredientCrate position={position} ingredient="lechuga" label="Lechuga" />;
}

export function TomatoCrate({ position }: { position: [number, number] }) {
  return <IngredientCrate position={position} ingredient="tomate" label="Tomate" />;
}

export function OnionCrate({ position }: { position: [number, number] }) {
  return <IngredientCrate position={position} ingredient="cebolla" label="Cebolla" />;
}

export function ShrimpCrate({ position }: { position: [number, number] }) {
  return <IngredientCrate position={position} ingredient="camaron" label="Camarón" rotationY={Math.PI} />;
}

export function FishCrate({ position }: { position: [number, number] }) {
  return <IngredientCrate position={position} ingredient="pescado" label="Pescado" rotationY={Math.PI} />;
}

export function BurgerCrate({ position }: { position: [number, number] }) {
  return <IngredientCrate position={position} ingredient="carne" label="Carne" rotationY={Math.PI} />;
}

export function ChoppingBoard({
  position,
  item,
  chopProgress,
}: {
  position: [number, number];
  item: BoardItem;
  chopProgress: number;
}) {
  const { scene: boardScene } = useGLTF(CUTTING_BOARD_MODEL);
  const { scene: knifeScene } = useGLTF(KNIFE_MODEL);
  const isChopping = !!item && !item.chopped && chopProgress > 0;
  return (
    <group position={[position[0], 0, position[1]]}>
      <Clone object={boardScene} scale={0.78} position={[0, 0.71, 0]} receiveShadow />
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
      {isChopping && (
        <Clone
          object={knifeScene}
          scale={0.5}
          position={[0.18, 0.76, -0.05]}
          rotation={[0, Math.PI / 5, 0]}
          castShadow
        />
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
  const plankCount = Math.max(3, Math.round(width / 0.7));
  return (
    <group position={[position[0], 0, position[1]]}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.7, 0.85]} />
        <meshStandardMaterial color="#9c6b3e" />
      </mesh>
      {Array.from({ length: plankCount - 1 }).map((_, i) => (
        <mesh key={i} position={[-width / 2 + ((i + 1) * width) / plankCount, 0.706, 0]}>
          <boxGeometry args={[0.015, 0.008, 0.83]} />
          <meshStandardMaterial color="#6b4423" />
        </mesh>
      ))}
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

const FLAME_OFFSETS: [number, number][] = [
  [0.12, 0],
  [-0.1, 0.08],
  [-0.05, -0.11],
  [0.02, 0.1],
];

function StoveFlame() {
  const groupRef = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((flame, i) => {
      const flicker = Math.sin(t * 9 + i * 2.1) * 0.15 + Math.sin(t * 17 + i) * 0.08;
      flame.scale.setScalar(1 + flicker);
      flame.position.y = 0.08 + Math.abs(flicker) * 0.05;
    });
  });
  return (
    <group ref={groupRef} position={[0, 0.72, 0]}>
      {FLAME_OFFSETS.map((o, i) => (
        <mesh key={i} position={[o[0], 0.08, o[1]]}>
          <coneGeometry args={[0.045, 0.16, 8]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#ff9800" : "#ffca28"}
            emissive={i % 2 === 0 ? "#ff6d00" : "#ffab00"}
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      ))}
      <pointLight color="#ff9800" intensity={1.2} distance={1.2} position={[0, 0.15, 0]} />
    </group>
  );
}

export function Stove({ position, slot }: { position: [number, number]; slot: StoveSlot }) {
  const { scene } = useGLTF(STOVE_MODEL);
  const isLit = slot.potPresent && slot.content?.state === "cocinando";
  return (
    <group position={[position[0], 0, position[1]]}>
      <Clone object={scene} scale={1.75} position={STOVE_SINK_MODEL_OFFSET} castShadow receiveShadow />
      {isLit && <StoveFlame />}
      {slot.potPresent && (
        <group position={[0, 0.78, 0]}>
          <ItemMesh item={{ kind: "olla", content: slot.content }} />
        </group>
      )}
      {slot.potPresent && slot.content?.state === "cocinando" && (
        <Text position={[0, 1.4, 0]} fontSize={0.13} color="#ffd54f" anchorX="center">
          {Math.min(100, Math.round((slot.content.progress / COOK_DONE_AT) * 100))}%
        </Text>
      )}
      {slot.potPresent && slot.content?.state === "listo" && (
        <Text position={[0, 1.4, 0]} fontSize={0.13} color="#ffd54f" anchorX="center">
          ¡Lista!
        </Text>
      )}
      {slot.potPresent && slot.content?.state === "quemado" && (
        <Text position={[0, 1.4, 0]} fontSize={0.13} color="#ff5252" anchorX="center">
          Quemado
        </Text>
      )}
    </group>
  );
}

function PlateModel({ position, dirty = false }: { position: [number, number, number]; dirty?: boolean }) {
  const { scene } = useGLTF(PLATE_MODEL);
  return (
    <group position={position}>
      <Clone object={scene} scale={0.62} castShadow />
      {dirty && <PlateStains />}
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
        <PlateModel key={i} position={[0, 0.72 + i * 0.065, 0]} />
      ))}
      <Text position={[0, 1.05, 0]} fontSize={0.14} color="#333333" anchorX="center">
        {cleanPlates}
      </Text>
    </group>
  );
}

const CONVEYOR_BAR_COUNT = 4;
const CONVEYOR_TRAVEL = 0.9;

/** Barras oscuras que se deslizan sobre la cinta para simular el movimiento hacia afuera. */
function ConveyorTread() {
  const groupRef = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((bar, i) => {
      const phase = (t * 0.5 + i / CONVEYOR_BAR_COUNT) % 1;
      bar.position.x = -CONVEYOR_TRAVEL / 2 + phase * CONVEYOR_TRAVEL;
    });
  });
  return (
    <group ref={groupRef} position={[0, 0.56, 0]}>
      {Array.from({ length: CONVEYOR_BAR_COUNT }).map((_, i) => (
        <mesh key={i}>
          <boxGeometry args={[0.08, 0.02, 0.44]} />
          <meshStandardMaterial color="#ffb300" emissive="#ff8f00" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export function DeliveryWindow({ position, rotationY = 0 }: { position: [number, number]; rotationY?: number }) {
  const { scene } = useGLTF(CONVEYOR_MODEL);
  return (
    <group position={[position[0], 0, position[1]]} rotation={[0, rotationY, 0]}>
      <Clone object={scene} scale={1.3} castShadow receiveShadow />
      <ConveyorTread />
    </group>
  );
}

/** Mesita junto al lavaplatos donde se apilan los platos sucios entregados, a la espera de ser lavados. */
export function DirtyPlateStack({ position, count }: { position: [number, number]; count: number }) {
  return (
    <group position={[position[0], 0, position[1]]}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.6, 0.55]} />
        <meshStandardMaterial color="#7a5c44" />
      </mesh>
      {count > 0 &&
        Array.from({ length: Math.min(count, 5) }).map((_, i) => (
          <PlateModel key={i} position={[0, 0.62 + i * 0.065, 0]} dirty />
        ))}
      {count > 0 && (
        <Text position={[0, 0.8, 0]} fontSize={0.13} color="#ffb74d" anchorX="center">
          {count} sucio{count > 1 ? "s" : ""}
        </Text>
      )}
    </group>
  );
}

export function Sink({
  position,
  washQueue,
  washProgress,
}: {
  position: [number, number];
  washQueue: number;
  washProgress: number;
}) {
  const { scene } = useGLTF(SINK_MODEL);
  return (
    <group position={[position[0], 0, position[1]]}>
      <Clone object={scene} scale={1.75} position={STOVE_SINK_MODEL_OFFSET} castShadow receiveShadow />
      {washQueue > 0 && (
        <>
          <Text position={[0, 1.35, 0]} fontSize={0.15} color="#ffb74d" anchorX="center">
            {washQueue} por lavar
          </Text>
          {washProgress > 0 && (
            <mesh position={[0, 1.25, 0]}>
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
  const { scene } = useGLTF(TRASHCAN_MODEL);
  return (
    <group position={[position[0], 0, position[1]]}>
      <Clone object={scene} scale={1.7} castShadow receiveShadow />
    </group>
  );
}

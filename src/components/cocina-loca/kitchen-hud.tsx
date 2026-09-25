"use client";

import type { Carrying } from "@/components/cocina-loca/game-types";
import { cn } from "@/lib/utils";

const CARRYING_LABEL: Record<string, (c: Extract<Carrying, object>) => string> = {
  ingrediente: (c) => {
    const item = c as Extract<Carrying, { kind: "ingrediente" }>;
    return `${item.chopped ? "Picado" : "Crudo"}: ${item.ingrediente}`;
  },
  quemado: () => "Quemado (bota a la basura)",
  olla: (c) => {
    const item = c as Extract<Carrying, { kind: "olla" }>;
    if (!item.content) return "Olla vacía";
    if (item.content.state === "cocinando") return `Olla: cocinando ${Math.round(item.content.progress * 100)}%`;
    if (item.content.state === "quemado") return "Olla: se quemó (bota a la basura)";
    return "Olla: salsa lista";
  },
  plato: (c) => {
    const item = c as Extract<Carrying, { kind: "plato" }>;
    return item.contenido.length === 0 ? "Plato vacío" : `Plato: ${item.contenido.join(" + ")}`;
  },
  platoSucio: () => "Plato sucio",
};

export type HudOrder = { label: string; description: string; secondsLeft: number };

export function KitchenHud({
  score,
  orders,
  carrying,
  targetLabel,
  message,
}: {
  score: number;
  orders: HudOrder[];
  carrying: Carrying;
  targetLabel: string | null;
  message: string | null;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 text-sm text-white">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          {orders.map((order, i) => (
            <div
              key={`${order.label}-${i}`}
              title={order.description}
              className="pointer-events-auto flex w-fit items-center gap-2 rounded-full bg-black/50 py-1 pr-2.5 pl-1 backdrop-blur-sm"
            >
              <span className="text-sm leading-none">🧾</span>
              <span className="max-w-36 truncate text-xs font-semibold">{order.label}</span>
              <span
                className={cn(
                  "font-mono text-xs font-semibold",
                  order.secondsLeft <= 10 ? "text-red-400" : "text-white/70",
                )}
              >
                {Math.ceil(order.secondsLeft)}s
              </span>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-black/50 px-3 py-2 text-right backdrop-blur-sm">
          <p className="font-semibold">Puntaje: {score}</p>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="rounded-lg bg-black/50 px-3 py-2 backdrop-blur-sm">
          <p className="text-xs text-white/70">Flechas/WASD: moverse · Espacio: interactuar (mantener para picar/lavar)</p>
          {targetLabel && <p className="text-xs font-semibold text-amber-300">Frente a: {targetLabel}</p>}
        </div>
        <div className="rounded-lg bg-black/50 px-3 py-2 text-right backdrop-blur-sm">
          <p className="text-xs text-white/70">En mano</p>
          <p className="font-semibold">
            {carrying ? CARRYING_LABEL[carrying.kind](carrying) : "Nada"}
          </p>
        </div>
      </div>

      {message && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-black/70 px-4 py-2 text-center font-semibold backdrop-blur-sm">
          {message}
        </div>
      )}
    </div>
  );
}

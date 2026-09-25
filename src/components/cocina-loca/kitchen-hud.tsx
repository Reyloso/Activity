"use client";

import type { Carrying } from "@/components/cocina-loca/game-types";

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

export function KitchenHud({
  score,
  orderSecondsLeft,
  carrying,
  targetLabel,
  message,
}: {
  score: number;
  orderSecondsLeft: number;
  carrying: Carrying;
  targetLabel: string | null;
  message: string | null;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 text-sm text-white">
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-black/50 px-3 py-2 backdrop-blur-sm">
          <p className="font-semibold">Pedido: Ensalada con salsa</p>
          <p className="text-xs text-white/80">Lechuga picada + tomate picado y cocinado, en un plato</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="rounded-lg bg-black/50 px-3 py-2 text-right backdrop-blur-sm">
            <p className="font-semibold">Puntaje: {score}</p>
          </div>
          <div className="rounded-lg bg-black/50 px-3 py-2 text-right backdrop-blur-sm">
            <p className={orderSecondsLeft <= 10 ? "font-semibold text-red-400" : "font-semibold"}>
              ⏱ {Math.ceil(orderSecondsLeft)}s
            </p>
          </div>
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

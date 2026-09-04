"use client";

import { SlideShell } from "@/components/activities/slide-shell";
import type { ModuleProps } from "@/activities/types";

export default function Module5Pareto({ onComplete, completed }: ModuleProps) {
  return (
    <SlideShell title="La regla del 80/20 (Pareto)" completed={completed} onComplete={onComplete}>
      <p>
        El economista Vilfredo Pareto notó que el 20% de algo suele generar el 80% del resultado. En
        el trabajo diario pasa lo mismo: de todas tus tareas, un pequeño grupo concentra la mayor
        parte del impacto real.
      </p>
      <div className="rounded-lg border bg-secondary/30 p-4">
        <p className="font-semibold">Cómo aplicarlo</p>
        <p className="mt-1 text-muted-foreground">
          De tu lista de pendientes de hoy, identifica cuáles 1 o 2 tareas &mdash;si las
          completaras y ninguna otra&mdash; harían que el día se sienta un éxito. Esas son tu
          20%. El resto puede esperar, delegarse o eliminarse.
        </p>
      </div>
      <p className="text-muted-foreground">
        No se trata de trabajar más rápido en todo, sino de dejar de darle el mismo peso a tareas
        que no generan el mismo resultado.
      </p>
    </SlideShell>
  );
}

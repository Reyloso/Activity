"use client";

import { CheckCircle2 } from "lucide-react";
import { SlideShell } from "@/components/activities/slide-shell";
import type { ModuleProps } from "@/activities/types";

const checklist = [
  "Cada mañana, identifica tu \"rana\": la tarea más importante del día, y hazla primero.",
  "Antes de aceptar una tarea nueva, ubícala en un cuadrante: ¿es urgente, importante, ambas o ninguna?",
  "De tu lista semanal, marca el 20% de tareas que generan el 80% del resultado.",
  "Bloquea al menos un espacio en tu calendario para \"Planificar\", no solo para \"Hacer ya\".",
  "Antes de decir que sí a algo nuevo, pregúntate qué dejarías de hacer para cumplirlo.",
];

export default function Module8ChecklistCierre({ onComplete, completed }: ModuleProps) {
  return (
    <SlideShell title="Tu checklist para esta semana" completed={completed} onComplete={onComplete}>
      <p>
        No necesitas aplicar todo a la vez. Elige uno o dos de estos hábitos y empieza el lunes:
      </p>
      <ul className="flex flex-col gap-2">
        {checklist.map((item) => (
          <li key={item} className="flex gap-2 rounded-lg border p-3">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground">
        Ahora vamos a ponerlo en práctica con una actividad interactiva.
      </p>
    </SlideShell>
  );
}

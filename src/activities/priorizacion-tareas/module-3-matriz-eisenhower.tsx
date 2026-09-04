"use client";

import { SlideShell } from "@/components/activities/slide-shell";
import type { ModuleProps } from "@/activities/types";

const quadrants = [
  {
    label: "Hacer ya",
    hint: "Urgente + Importante",
    detail: "Crisis, deadlines reales.",
    color: "bg-red-50 border-red-200 text-red-900",
  },
  {
    label: "Planificar",
    hint: "Importante, no urgente",
    detail: "Estrategia, mejora continua. Aquí debería vivir la mayoría del tiempo del equipo.",
    color: "bg-emerald-50 border-emerald-200 text-emerald-900",
  },
  {
    label: "Delegar",
    hint: "Urgente, no importante",
    detail: "Interrupciones, algunas reuniones.",
    color: "bg-amber-50 border-amber-200 text-amber-900",
  },
  {
    label: "Eliminar",
    hint: "Ni urgente ni importante",
    detail: "Distracciones.",
    color: "bg-slate-100 border-slate-200 text-slate-700",
  },
];

export default function Module3MatrizEisenhower({ onComplete, completed }: ModuleProps) {
  return (
    <SlideShell title="La Matriz de Eisenhower" completed={completed} onComplete={onComplete}>
      <p>
        Para dejar de decidir por instinto, cruzamos las dos preguntas del módulo anterior en una
        matriz de cuatro cuadrantes. Cada tarea que tienes hoy cae en uno de estos cuatro:
      </p>
      <div className="grid grid-cols-2 gap-3">
        {quadrants.map((q) => (
          <div key={q.label} className={`rounded-lg border p-4 ${q.color}`}>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{q.hint}</p>
            <p className="text-lg font-bold">{q.label}</p>
            <p className="mt-1 text-sm opacity-90">{q.detail}</p>
          </div>
        ))}
      </div>
    </SlideShell>
  );
}

"use client";

import { SlideShell } from "@/components/activities/slide-shell";
import type { ModuleProps } from "@/activities/types";

const errors = [
  {
    title: "Confundir urgente con importante",
    why: "La bandeja de entrada y el chat del equipo se sienten como una lista de prioridades, pero solo reflejan lo que otros necesitan de ti ahora, no lo que tú necesitas lograr.",
    fix: "Antes de reaccionar, pregúntate si esa tarea mueve tus metas o solo apaga un fuego ajeno.",
  },
  {
    title: "Decir que sí a todo",
    why: "Cada compromiso nuevo le quita tiempo a algo más. Aceptar sin evaluar el costo de oportunidad es la forma más rápida de llenar la agenda de cosas que no importan.",
    fix: "Antes de aceptar, pregunta qué dejarías de hacer para cumplir con esto.",
  },
  {
    title: "Vivir apagando incendios",
    why: "Cuando todo el tiempo se va en el cuadrante \"Hacer ya\", nunca queda espacio para \"Planificar\" — y sin planificación, los incendios se repiten.",
    fix: "Protege al menos un bloque de tiempo a la semana exclusivo para planificar, aunque nada urgente lo esté pidiendo.",
  },
  {
    title: "Hacer multitarea constante",
    why: "Cambiar de tarea todo el tiempo se siente productivo, pero cada cambio tiene un costo de reenfoque. El resultado es más tareas empezadas y menos terminadas.",
    fix: "Trabaja una tarea a la vez, en bloques, y deja las notificaciones para después.",
  },
  {
    title: "No poner límites",
    why: "Sin límites claros, cualquier persona o cualquier mensaje puede secuestrar tu agenda del día.",
    fix: "Comunica con anticipación cuándo estás disponible para interrupciones y cuándo no.",
  },
];

export default function Module7Errores({ onComplete, completed }: ModuleProps) {
  return (
    <SlideShell title="Errores comunes al priorizar" completed={completed} onComplete={onComplete}>
      <div className="flex flex-col gap-3">
        {errors.map((error) => (
          <div key={error.title} className="rounded-lg border p-3">
            <p className="font-semibold">{error.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{error.why}</p>
            <p className="mt-2 text-sm">
              <span className="font-medium text-emerald-700">Cómo evitarlo: </span>
              {error.fix}
            </p>
          </div>
        ))}
      </div>
    </SlideShell>
  );
}

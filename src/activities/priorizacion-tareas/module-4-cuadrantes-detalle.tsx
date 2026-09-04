"use client";

import { SlideShell } from "@/components/activities/slide-shell";
import type { ModuleProps } from "@/activities/types";

const quadrants = [
  {
    label: "Hacer ya",
    action: "Hazlo tú, ahora mismo.",
    examples: ["Un cliente reporta que el sistema está caído.", "Una entrega con deadline hoy."],
    color: "border-red-200",
  },
  {
    label: "Planificar",
    action: "Bloquea tiempo en tu calendario esta semana.",
    examples: ["Definir el plan del próximo trimestre.", "Capacitarte en una herramienta nueva."],
    color: "border-emerald-200",
  },
  {
    label: "Delegar",
    action: "Pregúntate: ¿quién más en el equipo puede hacer esto?",
    examples: ["Agendar una reunión recurrente.", "Responder una solicitud que otro puede resolver."],
    color: "border-amber-200",
  },
  {
    label: "Eliminar",
    action: "Elimínalo del todo, sin culpa.",
    examples: ["Revisar redes sociales entre tareas.", "Una reunión sin agenda ni objetivo claro."],
    color: "border-slate-200",
  },
];

export default function Module4CuadrantesDetalle({ onComplete, completed }: ModuleProps) {
  return (
    <SlideShell title="¿Qué hacer en cada cuadrante?" completed={completed} onComplete={onComplete}>
      <p>
        Identificar el cuadrante es solo el primer paso. Lo que cambia el resultado es la acción que
        tomas una vez sabes dónde cae la tarea:
      </p>
      <div className="flex flex-col gap-3">
        {quadrants.map((q) => (
          <div key={q.label} className={`rounded-lg border p-3 ${q.color}`}>
            <p className="font-semibold">{q.label}</p>
            <p className="text-sm text-muted-foreground">{q.action}</p>
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {q.examples.map((example) => (
                <li key={example} className="flex gap-2">
                  <span className="text-muted-foreground">·</span>
                  <span>{example}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SlideShell>
  );
}

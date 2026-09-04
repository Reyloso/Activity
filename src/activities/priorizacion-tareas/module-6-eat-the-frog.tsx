"use client";

import { SlideShell } from "@/components/activities/slide-shell";
import type { ModuleProps } from "@/activities/types";

export default function Module6EatTheFrog({ onComplete, completed }: ModuleProps) {
  return (
    <SlideShell title="Eat the frog" completed={completed} onComplete={onComplete}>
      <p>
        La frase viene de Mark Twain: &quot;si tu trabajo es comerte una rana viva, hazlo a primera
        hora de la mañana&quot;. Tu &quot;rana&quot; es la tarea más importante y probablemente la
        que más estás evitando.
      </p>
      <p>
        Tu fuerza de voluntad y tu capacidad de concentración son más altas temprano en el día. Si
        dejas la tarea difícil para &quot;cuando tenga un momento libre&quot;, ese momento casi nunca
        llega.
      </p>
      <div className="rounded-lg border bg-secondary/30 p-4">
        <p className="font-semibold">Tip extra: time blocking</p>
        <p className="mt-1 text-muted-foreground">
          Reserva un bloque fijo en tu calendario &mdash;idealmente al inicio del día&mdash; solo
          para tu tarea más importante, antes de abrir el correo o el chat del equipo.
        </p>
      </div>
    </SlideShell>
  );
}

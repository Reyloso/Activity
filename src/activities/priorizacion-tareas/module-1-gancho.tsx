"use client";

import { SlideShell } from "@/components/activities/slide-shell";
import type { ModuleProps } from "@/activities/types";

export default function Module1Gancho({ onComplete, completed }: ModuleProps) {
  return (
    <SlideShell title="¿Trabajaste todo el día... y no avanzaste en nada importante?" completed={completed} onComplete={onComplete}>
      <p>
        Es una sensación muy común: el día se llena de mensajes, reuniones y tareas urgentes, pero
        al final las cosas que de verdad mueven la aguja quedaron para &quot;mañana&quot;.
      </p>
      <p>
        Piénsalo así: si hoy llegaras a fin de día y solo pudieras dar por terminada{" "}
        <strong>una</strong> tarea, ¿sabrías cuál elegir? La mayoría de las veces terminamos el día
        habiendo respondido a lo que más ruido hizo, no a lo que más valor generaba.
      </p>
      <p>
        En esta actividad vamos a aprender a distinguir <strong>qué es urgente</strong> de{" "}
        <strong>qué es importante</strong>, a usar la Matriz de Eisenhower y otras dos herramientas
        prácticas para priorizar, a reconocer los errores más comunes al hacerlo, y a salir con un
        checklist que puedas aplicar desde el lunes.
      </p>
    </SlideShell>
  );
}

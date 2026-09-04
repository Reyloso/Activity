"use client";

import { SlideShell } from "@/components/activities/slide-shell";
import type { ModuleProps } from "@/activities/types";

export default function Module2UrgenteVsImportante({ onComplete, completed }: ModuleProps) {
  return (
    <SlideShell title="Urgente vs. importante: no son lo mismo" completed={completed} onComplete={onComplete}>
      <p>
        <strong>Urgente</strong> es lo que exige atención inmediata: tiene un plazo cercano o alguien
        lo está esperando ya. <strong>Importante</strong> es lo que contribuye a tus metas y a los
        resultados de largo plazo, tengan o no una fecha límite hoy.
      </p>
      <p>
        El problema es que lo urgente siempre grita más fuerte que lo importante. Una notificación,
        una llamada o un correo con &quot;ASAP&quot; en el asunto activan una sensación de urgencia
        que casi nunca corresponde con su verdadera importancia.
      </p>
      <div className="rounded-lg border bg-secondary/30 p-4">
        <p className="font-semibold">La idea clave</p>
        <p className="mt-1 text-muted-foreground">
          Que algo se sienta urgente no lo hace importante. Y muchas de las tareas realmente
          importantes &mdash;planear, capacitarte, cuidar una relación clave&mdash; nunca se sienten
          urgentes hasta que ya es tarde.
        </p>
      </div>
    </SlideShell>
  );
}

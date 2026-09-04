"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ModuleProps } from "@/activities/types";

type QuadrantId = "hacer" | "planificar" | "delegar" | "eliminar";

const quadrants: { id: QuadrantId; label: string; hint: string }[] = [
  { id: "hacer", label: "Hacer ya", hint: "Urgente + Importante" },
  { id: "planificar", label: "Planificar", hint: "Importante, no urgente" },
  { id: "delegar", label: "Delegar", hint: "Urgente, no importante" },
  { id: "eliminar", label: "Eliminar", hint: "Ni urgente ni importante" },
];

const tasks: { id: string; text: string; answer: QuadrantId }[] = [
  { id: "t1", text: "Responder un correo urgente de un cliente enojado", answer: "hacer" },
  { id: "t2", text: "Apagar un incendio de producción reportado ahora mismo", answer: "hacer" },
  { id: "t3", text: "Planear la estrategia de crecimiento del próximo trimestre", answer: "planificar" },
  { id: "t4", text: "Capacitarte en una herramienta que usarás todo el año", answer: "planificar" },
  { id: "t5", text: "Coordinar una reunión que puede asumir otro compañero", answer: "delegar" },
  { id: "t6", text: "Aprobar una solicitud de vacaciones del equipo", answer: "delegar" },
  { id: "t7", text: "Revisar el chat de memes de la oficina", answer: "eliminar" },
  { id: "t8", text: "Hacer scroll en redes sociales durante el trabajo", answer: "eliminar" },
];

export default function Module9ActividadMatrizEnVivo({ onComplete, completed }: ModuleProps) {
  const [assignments, setAssignments] = useState<Record<string, QuadrantId | undefined>>({});
  const [checked, setChecked] = useState(false);

  const allAssigned = tasks.every((t) => assignments[t.id]);
  const score = useMemo(
    () => tasks.filter((t) => assignments[t.id] === t.answer).length,
    [assignments],
  );

  const unassignedTasks = tasks.filter((t) => !assignments[t.id]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl">Actividad: La Matriz en Vivo</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <p className="text-muted-foreground">
          Clasifica cada tarea en el cuadrante correcto. Haz clic en una tarea y luego en el
          cuadrante donde crees que pertenece.
        </p>

        {unassignedTasks.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Tareas por clasificar</p>
            <div className="flex flex-col gap-2">
              {unassignedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  text={task.text}
                  onAssign={(quadrantId) => {
                    setAssignments((prev) => ({ ...prev, [task.id]: quadrantId }));
                    setChecked(false);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {quadrants.map((quadrant) => (
            <div key={quadrant.id} className="min-h-32 rounded-lg border p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {quadrant.hint}
              </p>
              <p className="mb-2 font-bold">{quadrant.label}</p>
              <div className="flex flex-col gap-1.5">
                {tasks
                  .filter((t) => assignments[t.id] === quadrant.id)
                  .map((task) => {
                    const isCorrect = task.answer === quadrant.id;
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md border bg-background px-2 py-1.5 text-sm",
                          checked && (isCorrect ? "border-emerald-300" : "border-red-300"),
                        )}
                      >
                        {checked &&
                          (isCorrect ? (
                            <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                          ) : (
                            <XCircle className="size-3.5 shrink-0 text-red-600" />
                          ))}
                        <span>{task.text}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {checked && (
          <p className="font-medium">
            Puntaje: {score} / {tasks.length}
          </p>
        )}
      </CardContent>
      <CardFooter className="gap-3">
        {!checked ? (
          <Button disabled={!allAssigned} onClick={() => setChecked(true)}>
            Verificar clasificación
          </Button>
        ) : (
          <Button onClick={onComplete} disabled={completed} className="gap-2">
            {completed ? (
              <>
                <CheckCircle2 className="size-4" /> Actividad completada
              </>
            ) : (
              "Finalizar actividad"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function TaskCard({ text, onAssign }: { text: string; onAssign: (quadrant: QuadrantId) => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-secondary/30 p-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm">{text}</span>
      <div className="flex flex-wrap gap-1.5">
        {quadrants.map((q) => (
          <Button key={q.id} size="sm" variant="outline" onClick={() => onAssign(q.id)}>
            {q.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

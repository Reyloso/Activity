"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, PartyPopper, RotateCcw, XCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Answer = "urgente" | "importante" | "ambas" | "ninguna";

const options: { id: Answer; label: string }[] = [
  { id: "urgente", label: "Urgente" },
  { id: "importante", label: "Importante" },
  { id: "ambas", label: "Ambas" },
  { id: "ninguna", label: "Ninguna" },
];

const cards: { text: string; answer: Answer }[] = [
  { text: "Un cliente reporta que el sistema está caído ahora mismo.", answer: "ambas" },
  { text: "Planear la estrategia del equipo para el próximo trimestre.", answer: "importante" },
  { text: "Alguien te pide en el chat que respondas \"ya\" algo sin mayor impacto.", answer: "urgente" },
  { text: "Hacer scroll en redes sociales entre tareas.", answer: "ninguna" },
  { text: "Capacitarte en una habilidad que usarás todo el año.", answer: "importante" },
  { text: "Una reunión sin agenda ni objetivo claro.", answer: "ninguna" },
  { text: "Entregar un reporte con deadline hoy que sí afecta al negocio.", answer: "ambas" },
  { text: "Una notificación que interrumpe pero no requiere acción tuya.", answer: "urgente" },
];

export default function UrgenteOImportanteGame() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<Answer | null>(null);

  const current = cards[index];
  const finished = index >= cards.length;
  const progress = useMemo(() => `${Math.min(index, cards.length)}/${cards.length}`, [index]);

  function handleAnswer(answer: Answer) {
    if (selected) return;
    setSelected(answer);
    if (answer === current.answer) setScore((s) => s + 1);
  }

  function next() {
    setSelected(null);
    setIndex((i) => i + 1);
  }

  function restart() {
    setIndex(0);
    setScore(0);
    setSelected(null);
  }

  if (finished) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <PartyPopper className="size-10 text-emerald-600" />
          <h2 className="text-xl font-semibold">¡Terminaste!</h2>
          <p className="text-muted-foreground">
            Acertaste {score} de {cards.length}.
          </p>
          <Button onClick={restart} className="mt-2 gap-2">
            <RotateCcw className="size-4" /> Jugar de nuevo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">¿Urgente o importante?</CardTitle>
          <span className="text-sm text-muted-foreground">{progress}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="rounded-lg border bg-secondary/30 p-6 text-center text-lg">{current.text}</p>
        <div className="grid grid-cols-2 gap-3">
          {options.map((option) => {
            const isCorrect = option.id === current.answer;
            const isPicked = option.id === selected;
            return (
              <Button
                key={option.id}
                variant="outline"
                disabled={!!selected}
                onClick={() => handleAnswer(option.id)}
                className={cn(
                  "h-auto justify-start gap-2 py-3",
                  selected && isCorrect && "border-emerald-400 bg-emerald-50 text-emerald-900",
                  selected && isPicked && !isCorrect && "border-red-300 bg-red-50 text-red-900",
                )}
              >
                {selected && isCorrect && <CheckCircle2 className="size-4" />}
                {selected && isPicked && !isCorrect && <XCircle className="size-4" />}
                {option.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
      {selected && (
        <CardFooter>
          <Button onClick={next}>{index === cards.length - 1 ? "Ver resultado" : "Siguiente"}</Button>
        </CardFooter>
      )}
    </Card>
  );
}

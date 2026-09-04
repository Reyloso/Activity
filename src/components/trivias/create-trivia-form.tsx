"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createTrivia, type CreateTriviaState } from "@/server/actions/trivias";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type OptionDraft = { text: string; isCorrect: boolean; points: number };
type QuestionDraft = { text: string; options: OptionDraft[] };

const optionStyles = [
  "border-red-300 bg-red-50 focus-within:ring-red-300",
  "border-blue-300 bg-blue-50 focus-within:ring-blue-300",
  "border-amber-300 bg-amber-50 focus-within:ring-amber-300",
  "border-emerald-300 bg-emerald-50 focus-within:ring-emerald-300",
];

function emptyQuestion(): QuestionDraft {
  return {
    text: "",
    options: [
      { text: "", isCorrect: true, points: 1000 },
      { text: "", isCorrect: false, points: 1000 },
      { text: "", isCorrect: false, points: 1000 },
      { text: "", isCorrect: false, points: 1000 },
    ],
  };
}

const initialState: CreateTriviaState = { error: null };

export function CreateTriviaForm() {
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [state, formAction, pending] = useActionState(createTrivia, initialState);

  function updateQuestionText(qIndex: number, text: string) {
    setQuestions((prev) => prev.map((q, i) => (i === qIndex ? { ...q, text } : q)));
  }

  function updateOptionText(qIndex: number, oIndex: number, text: string) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((o, j) => (j === oIndex ? { ...o, text } : o)) } : q,
      ),
    );
  }

  function toggleCorrect(qIndex: number, oIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options.map((o, j) => (j === oIndex ? { ...o, isCorrect: !o.isCorrect } : o)) }
          : q,
      ),
    );
  }

  function updateOptionPoints(qIndex: number, oIndex: number, points: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((o, j) => (j === oIndex ? { ...o, points } : o)) } : q,
      ),
    );
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }

  function removeQuestion(qIndex: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== qIndex));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos generales</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" required maxLength={80} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input id="description" name="description" maxLength={140} />
          </div>
          <label className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex flex-col">
              <span className="text-sm font-medium">Orden aleatorio</span>
              <span className="text-xs text-muted-foreground">
                Las preguntas saldrán en un orden distinto cada vez que se juegue.
              </span>
            </div>
            <Switch checked={shuffleQuestions} onCheckedChange={setShuffleQuestions} />
          </label>
        </CardContent>
      </Card>

      {questions.map((question, qIndex) => (
        <Card key={qIndex}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Pregunta {qIndex + 1}</CardTitle>
              {questions.length > 1 && (
                <Button type="button" size="sm" variant="ghost" onClick={() => removeQuestion(qIndex)}>
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              value={question.text}
              onChange={(e) => updateQuestionText(qIndex, e.target.value)}
              placeholder="Escribe la pregunta"
              required
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {question.options.map((option, oIndex) => (
                <div
                  key={oIndex}
                  className={cn("flex flex-col gap-2 rounded-lg border p-2 focus-within:ring-2", optionStyles[oIndex])}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={option.isCorrect}
                      onChange={() => toggleCorrect(qIndex, oIndex)}
                      className="size-4 accent-emerald-600"
                      title="Marcar como correcta"
                    />
                    <Input
                      value={option.text}
                      onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                      placeholder={`Opción ${oIndex + 1}`}
                      required
                      className="border-none bg-transparent shadow-none focus-visible:ring-0"
                    />
                  </div>
                  <div className="flex items-center gap-2 pl-6">
                    <Label className="text-xs text-muted-foreground">Puntos si es correcta</Label>
                    <Input
                      type="number"
                      min={0}
                      step={50}
                      value={option.points}
                      onChange={(e) => updateOptionPoints(qIndex, oIndex, Number(e.target.value))}
                      className="h-7 w-24 bg-white/70"
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Marca todas las opciones que consideres correctas. El puntaje se otorga según qué tan rápido responda
              cada jugador.
            </p>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={addQuestion} className="w-fit gap-1.5">
        <Plus className="size-4" /> Agregar pregunta
      </Button>

      <input type="hidden" name="questions" value={JSON.stringify(questions)} />
      <input type="hidden" name="shuffleQuestions" value={shuffleQuestions ? "1" : "0"} />

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Guardando..." : "Guardar trivia"}
      </Button>
    </form>
  );
}

"use client";

import { useActionState, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createActivity, updateActivity, type CreateActivityState } from "@/server/actions/admin";
import { getVideoEmbedUrl } from "@/lib/video-embed";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type OptionDraft = { text: string; isCorrect: boolean };
export type QuestionDraft = { text: string; points: number; options: OptionDraft[] };
export type ModuleDraft = {
  title: string;
  content: string;
  videoUrl: string;
  passingScore: number;
  questions: QuestionDraft[];
};

function emptyModule(): ModuleDraft {
  return { title: "", content: "", videoUrl: "", passingScore: 70, questions: [] };
}

function emptyQuestion(): QuestionDraft {
  return {
    text: "",
    points: 0,
    options: [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
    ],
  };
}

const initialState: CreateActivityState = { error: null };

const MAX_CONTENT_BYTES = 15 * 1024 * 1024;

function formatMb(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(1);
}

function MediaFields({ module, update }: { module: ModuleDraft; update: (patch: Partial<ModuleDraft>) => void }) {
  const embedUrl = module.videoUrl ? getVideoEmbedUrl(module.videoUrl) : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label>URL de video de YouTube o Drive (opcional)</Label>
        <Input
          value={module.videoUrl}
          onChange={(e) => update({ videoUrl: e.target.value })}
          placeholder="https://youtube.com/watch?v=... o https://drive.google.com/file/d/..."
        />
        {module.videoUrl && embedUrl && (
          <div className="aspect-video w-full max-w-md overflow-hidden rounded-lg border">
            <iframe src={embedUrl} className="size-full" allowFullScreen />
          </div>
        )}
        {module.videoUrl && !embedUrl && (
          <p className="text-xs text-destructive">No se reconoce como un enlace de YouTube o Drive.</p>
        )}
      </div>
    </div>
  );
}

function QuestionEditor({
  question,
  onChange,
  onRemove,
}: {
  question: QuestionDraft;
  onChange: (q: QuestionDraft) => void;
  onRemove: () => void;
}) {
  function updateOption(index: number, patch: Partial<OptionDraft>) {
    onChange({ ...question, options: question.options.map((o, i) => (i === index ? { ...o, ...patch } : o)) });
  }

  function setCorrect(index: number) {
    onChange({ ...question, options: question.options.map((o, i) => ({ ...o, isCorrect: i === index })) });
  }

  function addOption() {
    onChange({ ...question, options: [...question.options, { text: "", isCorrect: false }] });
  }

  function removeOption(index: number) {
    if (question.options.length <= 2) return;
    const wasCorrect = question.options[index].isCorrect;
    const remaining = question.options.filter((_, i) => i !== index);
    if (wasCorrect) remaining[0].isCorrect = true;
    onChange({ ...question, options: remaining });
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex items-start gap-2">
        <Input
          value={question.text}
          onChange={(e) => onChange({ ...question, text: e.target.value })}
          placeholder="Texto de la pregunta"
          className="flex-1"
        />
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={0}
            value={question.points}
            onChange={(e) => onChange({ ...question, points: Number(e.target.value) })}
            className="w-20"
            title="Puntos (0 = sin puntaje)"
          />
          <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Puntos: 0 = pregunta sin puntaje (no afecta la aprobación).</p>
      <div className="flex flex-col gap-1.5">
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="radio"
              checked={option.isCorrect}
              onChange={() => setCorrect(index)}
              title="Marcar como correcta"
            />
            <Input
              value={option.text}
              onChange={(e) => updateOption(index, { text: e.target.value })}
              placeholder={`Opción ${index + 1}`}
              className="flex-1"
            />
            {question.options.length > 2 && (
              <Button type="button" size="sm" variant="ghost" onClick={() => removeOption(index)}>
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" size="sm" variant="outline" onClick={addOption} className="w-fit gap-1">
          <Plus className="size-3.5" /> Agregar opción
        </Button>
      </div>
    </div>
  );
}

export function CreateActivityForm({
  activityId,
  initialTitle = "",
  initialDescription = "",
  initialCoverColor = "2F3C7E",
  initialModules,
}: {
  activityId?: string;
  initialTitle?: string;
  initialDescription?: string;
  initialCoverColor?: string;
  initialModules?: ModuleDraft[];
}) {
  const isEdit = !!activityId;
  const [modules, setModules] = useState<ModuleDraft[]>(initialModules ?? [emptyModule()]);
  const [coverColor, setCoverColor] = useState(initialCoverColor);
  const action = isEdit ? updateActivity.bind(null, activityId) : createActivity;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const contentBytes = useMemo(() => new Blob([JSON.stringify(modules)]).size, [modules]);
  const isOverLimit = contentBytes > MAX_CONTENT_BYTES;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (contentBytes > MAX_CONTENT_BYTES) {
      e.preventDefault();
      setSizeError(
        `El contenido pesa ${formatMb(contentBytes)} MB, el máximo permitido es ${formatMb(MAX_CONTENT_BYTES)} MB. Reduce el tamaño o la cantidad de imágenes.`,
      );
    } else {
      setSizeError(null);
    }
  }

  function updateModule(index: number, patch: Partial<ModuleDraft>) {
    setModules((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function addModule() {
    setModules((prev) => [...prev, emptyModule()]);
  }

  function removeModule(index: number) {
    setModules((prev) => prev.filter((_, i) => i !== index));
  }

  function addQuestion(moduleIndex: number) {
    setModules((prev) =>
      prev.map((m, i) => (i === moduleIndex ? { ...m, questions: [...m.questions, emptyQuestion()] } : m)),
    );
  }

  function updateQuestion(moduleIndex: number, questionIndex: number, q: QuestionDraft) {
    setModules((prev) =>
      prev.map((m, i) =>
        i === moduleIndex ? { ...m, questions: m.questions.map((existing, j) => (j === questionIndex ? q : existing)) } : m,
      ),
    );
  }

  function removeQuestion(moduleIndex: number, questionIndex: number) {
    setModules((prev) =>
      prev.map((m, i) => (i === moduleIndex ? { ...m, questions: m.questions.filter((_, j) => j !== questionIndex) } : m)),
    );
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos generales</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" required maxLength={80} defaultValue={initialTitle} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              required
              maxLength={300}
              rows={3}
              defaultValue={initialDescription}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="coverColor">Color de portada</Label>
            <div className="flex items-center gap-2">
              <input
                id="coverColor"
                type="color"
                value={`#${coverColor}`}
                onChange={(e) => setCoverColor(e.target.value.replace("#", ""))}
                className="h-8 w-12 cursor-pointer rounded border"
              />
              <span className="text-sm text-muted-foreground">#{coverColor.toUpperCase()}</span>
            </div>
            <input type="hidden" name="coverColor" value={coverColor} />
          </div>
        </CardContent>
      </Card>

      {modules.map((module, index) => {
        const hasGradedQuestion = module.questions.some((q) => q.points > 0);
        return (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Módulo {index + 1}</CardTitle>
                {modules.length > 1 && (
                  <Button type="button" size="sm" variant="ghost" onClick={() => removeModule(index)}>
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                value={module.title}
                onChange={(e) => updateModule(index, { title: e.target.value })}
                placeholder="Título del módulo"
                required
              />
              <div className="flex flex-col gap-1">
                <Label>Contenido (opcional)</Label>
                <RichTextEditor value={module.content} onChange={(html) => updateModule(index, { content: html })} />
                <p className="text-xs text-muted-foreground">
                  Puedes pegar imágenes directamente (Ctrl/Cmd+V) o usar el botón de imagen de la barra.
                </p>
              </div>

              <MediaFields module={module} update={(patch) => updateModule(index, patch)} />

              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Preguntas (opcional)</p>
                {module.questions.map((question, qIndex) => (
                  <QuestionEditor
                    key={qIndex}
                    question={question}
                    onChange={(q) => updateQuestion(index, qIndex, q)}
                    onRemove={() => removeQuestion(index, qIndex)}
                  />
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addQuestion(index)}
                  className="w-fit gap-1.5"
                >
                  <Plus className="size-3.5" /> Agregar pregunta
                </Button>
                {hasGradedQuestion && (
                  <div className="mt-2 flex flex-col gap-2">
                    <Label>Puntaje mínimo para aprobar el módulo (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={module.passingScore}
                      onChange={(e) => updateModule(index, { passingScore: Number(e.target.value) })}
                      className="w-24"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Button type="button" variant="outline" onClick={addModule} className="w-fit gap-1.5">
        <Plus className="size-4" /> Agregar módulo
      </Button>

      <input type="hidden" name="modules" value={JSON.stringify(modules)} />

      <p className={cn("text-xs", isOverLimit ? "font-medium text-destructive" : "text-muted-foreground")}>
        Contenido: {formatMb(contentBytes)} MB de {formatMb(MAX_CONTENT_BYTES)} MB máximo (las imágenes pegadas
        ocupan espacio).
      </p>

      {sizeError && <p className="text-sm text-destructive">{sizeError}</p>}
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending || isOverLimit} className="w-fit">
        {pending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear actividad"}
      </Button>
    </form>
  );
}

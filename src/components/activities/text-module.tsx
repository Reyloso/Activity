"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { ModuleProps } from "@/activities/types";
import { Button } from "@/components/ui/button";
import { getVideoEmbedUrl } from "@/lib/video-embed";
import { isRichContentEmpty } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

function MediaPreview({ videoUrl }: { videoUrl?: string }) {
  const embedUrl = videoUrl ? getVideoEmbedUrl(videoUrl) : null;

  return (
    <>
      {videoUrl &&
        (embedUrl ? (
          <div className="aspect-video w-full overflow-hidden rounded-lg border">
            <iframe
              src={embedUrl}
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No se pudo interpretar el enlace de video:{" "}
            <a href={videoUrl} target="_blank" rel="noreferrer" className="underline">
              {videoUrl}
            </a>
          </p>
        ))}
    </>
  );
}

function Quiz({
  questions,
  passingScore,
  onComplete,
}: {
  questions: NonNullable<ModuleProps["questions"]>;
  passingScore?: number;
  onComplete: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ scorePct: number; passed: boolean } | null>(null);

  const gradedQuestions = useMemo(() => questions.filter((q) => q.points > 0), [questions]);
  const threshold = passingScore ?? 70;
  const allAnswered = questions.every((q) => answers[q.id]);

  function submit() {
    const totalPossible = gradedQuestions.reduce((sum, q) => sum + q.points, 0);
    const earned = gradedQuestions.reduce((sum, q) => {
      const chosenOptionId = answers[q.id];
      const chosen = q.options.find((o) => o.id === chosenOptionId);
      return sum + (chosen?.isCorrect ? q.points : 0);
    }, 0);
    const scorePct = totalPossible === 0 ? 100 : Math.round((earned / totalPossible) * 100);
    const passed = scorePct >= threshold;
    setResult({ scorePct, passed });
    if (passed) onComplete();
  }

  function retry() {
    setAnswers({});
    setResult(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {questions.map((question, qIndex) => (
        <div key={question.id} className="flex flex-col gap-2">
          <p className="text-sm font-medium">
            {qIndex + 1}. {question.text}
            {question.points > 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">({question.points} pts)</span>
            )}
          </p>
          <div className="flex flex-col gap-1.5">
            {question.options.map((option) => (
              <label
                key={option.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                  answers[question.id] === option.id ? "border-primary bg-primary/5" : "hover:bg-secondary/50",
                )}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={answers[question.id] === option.id}
                  onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
                  disabled={!!result}
                  className="accent-primary"
                />
                {option.text}
              </label>
            ))}
          </div>
        </div>
      ))}

      {result && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border p-3 text-sm font-medium",
            result.passed ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-red-300 bg-red-50 text-red-700",
          )}
        >
          {result.passed ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
          {result.passed
            ? `¡Aprobado! Obtuviste ${result.scorePct}%.`
            : `Obtuviste ${result.scorePct}%. Necesitas al menos ${threshold}% para aprobar.`}
        </div>
      )}

      {result && !result.passed ? (
        <Button onClick={retry} className="w-fit">
          Intentar de nuevo
        </Button>
      ) : !result ? (
        <Button onClick={submit} disabled={!allAnswered} className="w-fit">
          Enviar respuestas
        </Button>
      ) : null}
    </div>
  );
}

export function TextModule({ content, videoUrl, questions, passingScore, onComplete, completed }: ModuleProps) {
  const hasQuiz = !!questions && questions.length > 0;

  return (
    <div className="flex h-full min-h-[420px] flex-col justify-between gap-6 rounded-xl border p-6">
      <div className="flex flex-col gap-4">
        {!isRichContentEmpty(content) && (
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content! }} />
        )}
        <MediaPreview videoUrl={videoUrl} />
        {hasQuiz &&
          (completed ? (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="size-4" /> Ya completaste este módulo.
            </div>
          ) : (
            <Quiz questions={questions} passingScore={passingScore} onComplete={onComplete} />
          ))}
      </div>
      {!hasQuiz && (
        <Button onClick={onComplete} disabled={completed} className="w-fit gap-2">
          {completed ? (
            <>
              <CheckCircle2 className="size-4" /> Completado
            </>
          ) : (
            "Marcar como completado"
          )}
        </Button>
      )}
    </div>
  );
}

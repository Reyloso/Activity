"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { signTriviaSocketToken } from "@/lib/trivia-auth";

export type CreateTriviaState = { error: string | null };

type QuestionInput = { text: string; options: { text: string; isCorrect: boolean; points: number }[] };
type ParsedTrivia = {
  title: string;
  description: string | null;
  shuffleQuestions: boolean;
  usePoints: boolean;
  questions: QuestionInput[];
};

function parseTriviaFormData(formData: FormData): { error: string } | ParsedTrivia {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const questionsRaw = String(formData.get("questions") ?? "[]");
  const shuffleQuestions = formData.get("shuffleQuestions") === "1";
  const usePoints = formData.get("usePoints") === "1";

  if (!title) return { error: "El título es obligatorio." };

  let questions: QuestionInput[];
  try {
    questions = JSON.parse(questionsRaw);
  } catch {
    return { error: "Las preguntas no tienen un formato válido." };
  }

  if (questions.length === 0) return { error: "Agrega al menos una pregunta." };

  for (const q of questions) {
    if (!q.text.trim()) return { error: "Cada pregunta necesita un texto." };
    if (q.options.length !== 4 || q.options.some((o) => !o.text.trim())) {
      return { error: "Cada pregunta necesita exactamente 4 opciones con texto." };
    }
    if (q.options.some((o) => !Number.isFinite(o.points) || o.points < 0)) {
      return { error: "El puntaje de cada opción debe ser un número válido." };
    }
    if (q.options.filter((o) => o.isCorrect).length === 0) {
      return { error: "Cada pregunta necesita al menos una opción marcada como correcta." };
    }
  }

  return { title, description: description || null, shuffleQuestions, usePoints, questions };
}

export async function createTrivia(_prev: CreateTriviaState, formData: FormData): Promise<CreateTriviaState> {
  const session = await auth();
  if (!session?.user.id) throw new Error("No autenticado");

  const parsed = parseTriviaFormData(formData);
  if ("error" in parsed) return parsed;

  const trivia = await db.trivia.create({
    data: {
      title: parsed.title,
      description: parsed.description,
      shuffleQuestions: parsed.shuffleQuestions,
      usePoints: parsed.usePoints,
      createdById: session.user.id,
      questions: {
        create: parsed.questions.map((q, qIndex) => ({
          text: q.text,
          order: qIndex,
          options: {
            create: q.options.map((o, oIndex) => ({
              text: o.text,
              isCorrect: o.isCorrect,
              points: Math.round(o.points),
              order: oIndex,
            })),
          },
        })),
      },
    },
  });

  revalidatePath("/didacticas/trivias");
  redirect(`/didacticas/trivias?created=${trivia.id}`);
}

export async function updateTrivia(
  triviaId: string,
  _prev: CreateTriviaState,
  formData: FormData,
): Promise<CreateTriviaState> {
  const session = await auth();
  if (!session?.user.id) throw new Error("No autenticado");

  const trivia = await db.trivia.findUnique({ where: { id: triviaId } });
  if (!trivia) return { error: "La trivia no existe." };
  if (trivia.createdById !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "No puedes editar una trivia que no creaste." };
  }

  const parsed = parseTriviaFormData(formData);
  if ("error" in parsed) return parsed;

  await db.$transaction(async (tx) => {
    await tx.triviaQuestion.deleteMany({ where: { triviaId } });
    await tx.trivia.update({
      where: { id: triviaId },
      data: {
        title: parsed.title,
        description: parsed.description,
        shuffleQuestions: parsed.shuffleQuestions,
        usePoints: parsed.usePoints,
        questions: {
          create: parsed.questions.map((q, qIndex) => ({
            text: q.text,
            order: qIndex,
            options: {
              create: q.options.map((o, oIndex) => ({
                text: o.text,
                isCorrect: o.isCorrect,
                points: Math.round(o.points),
                order: oIndex,
              })),
            },
          })),
        },
      },
    });
  });

  revalidatePath("/didacticas/trivias");
  redirect(`/didacticas/trivias?updated=${triviaId}`);
}

export async function deleteTrivia(triviaId: string) {
  const session = await auth();
  if (!session?.user.id) throw new Error("No autenticado");

  const trivia = await db.trivia.findUnique({ where: { id: triviaId } });
  if (!trivia) return;
  if (trivia.createdById !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("No puedes eliminar una trivia que no creaste.");
  }

  await db.trivia.delete({ where: { id: triviaId } });
  revalidatePath("/didacticas/trivias");
}

export async function getTriviaSocketToken() {
  const session = await auth();
  if (!session?.user.id) throw new Error("No autenticado");
  return signTriviaSocketToken({ sub: session.user.id, name: session.user.name ?? "Jugador" });
}

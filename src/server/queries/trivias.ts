import { db } from "@/lib/db";

export async function getPublicTrivias() {
  return db.trivia.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true, lastName: true } },
      _count: { select: { questions: true } },
    },
  });
}

export async function getTriviaForEdit(triviaId: string) {
  return db.trivia.findUnique({
    where: { id: triviaId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { options: { orderBy: { order: "asc" } } },
      },
    },
  });
}

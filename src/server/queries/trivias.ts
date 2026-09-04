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

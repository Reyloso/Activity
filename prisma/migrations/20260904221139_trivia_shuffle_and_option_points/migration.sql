-- AlterTable
ALTER TABLE "Trivia" ADD COLUMN     "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TriviaOption" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 1000;

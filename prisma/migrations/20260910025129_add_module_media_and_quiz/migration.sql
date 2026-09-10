-- AlterTable
ALTER TABLE "ActivityModule" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "passingScore" INTEGER,
ADD COLUMN     "videoUrl" TEXT,
ALTER COLUMN "content" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ActivityModuleQuestion" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ActivityModuleQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityModuleOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ActivityModuleOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ActivityModuleQuestion" ADD CONSTRAINT "ActivityModuleQuestion_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "ActivityModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityModuleOption" ADD CONSTRAINT "ActivityModuleOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ActivityModuleQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

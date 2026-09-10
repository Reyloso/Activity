-- CreateTable
CREATE TABLE "ActivityModule" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ActivityModule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ActivityModule" ADD CONSTRAINT "ActivityModule_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

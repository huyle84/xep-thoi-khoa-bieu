-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "maxPeriodsPerAfternoon" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "maxPeriodsPerMorning" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "shortName" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "SubjectPeriod" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "gradeBlockId" TEXT NOT NULL,
    "periodsPerWeek" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SubjectPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixedPeriod" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "gradeBlockId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,

    CONSTRAINT "FixedPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubjectPeriod_subjectId_gradeBlockId_key" ON "SubjectPeriod"("subjectId", "gradeBlockId");

-- CreateIndex
CREATE UNIQUE INDEX "FixedPeriod_gradeBlockId_dayOfWeek_period_key" ON "FixedPeriod"("gradeBlockId", "dayOfWeek", "period");

-- AddForeignKey
ALTER TABLE "SubjectPeriod" ADD CONSTRAINT "SubjectPeriod_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectPeriod" ADD CONSTRAINT "SubjectPeriod_gradeBlockId_fkey" FOREIGN KEY ("gradeBlockId") REFERENCES "GradeBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedPeriod" ADD CONSTRAINT "FixedPeriod_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedPeriod" ADD CONSTRAINT "FixedPeriod_gradeBlockId_fkey" FOREIGN KEY ("gradeBlockId") REFERENCES "GradeBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

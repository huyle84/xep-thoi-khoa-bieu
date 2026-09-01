-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "gradeBlockId" TEXT;

-- AlterTable
ALTER TABLE "SchoolConfig" ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "setupCompleted" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "schoolName" SET DEFAULT 'Truong THPT';

-- AlterTable
ALTER TABLE "Subject" ALTER COLUMN "periodsPerWeek" SET DEFAULT 2;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "avatarUrl" TEXT;

-- AlterTable
ALTER TABLE "TeachingAssignment" ALTER COLUMN "periodsPerWeek" SET DEFAULT 1;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeBlock" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gradeNum" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',

    CONSTRAINT "GradeBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeriodConfig" (
    "id" TEXT NOT NULL,
    "periodNumber" INTEGER NOT NULL,
    "session" TEXT NOT NULL DEFAULT 'MORNING',
    "label" TEXT NOT NULL,
    "startTime" TEXT NOT NULL DEFAULT '',
    "endTime" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PeriodConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeroomAssignment" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL DEFAULT '2025-2026',

    CONSTRAINT "HomeroomAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "GradeBlock_gradeNum_key" ON "GradeBlock"("gradeNum");

-- CreateIndex
CREATE UNIQUE INDEX "PeriodConfig_periodNumber_key" ON "PeriodConfig"("periodNumber");

-- CreateIndex
CREATE UNIQUE INDEX "HomeroomAssignment_classId_key" ON "HomeroomAssignment"("classId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_gradeBlockId_fkey" FOREIGN KEY ("gradeBlockId") REFERENCES "GradeBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeroomAssignment" ADD CONSTRAINT "HomeroomAssignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeroomAssignment" ADD CONSTRAINT "HomeroomAssignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

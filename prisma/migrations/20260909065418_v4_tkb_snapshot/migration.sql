-- CreateTable
CREATE TABLE "TKBSnapshot" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "entryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TKBSnapshot_pkey" PRIMARY KEY ("id")
);

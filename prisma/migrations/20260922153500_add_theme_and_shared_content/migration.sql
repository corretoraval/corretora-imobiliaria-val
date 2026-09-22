ALTER TABLE "ConfiguracaoSite"
  ADD COLUMN "themePreset" TEXT NOT NULL DEFAULT 'ametista-ouro',
  ADD COLUMN "primaryColor" TEXT NOT NULL DEFAULT '#35104f',
  ADD COLUMN "primaryHover" TEXT NOT NULL DEFAULT '#4a1768',
  ADD COLUMN "accentColor" TEXT NOT NULL DEFAULT '#b58a3a',
  ADD COLUMN "accentLightColor" TEXT NOT NULL DEFAULT '#d8bd82',
  ADD COLUMN "backgroundColor" TEXT NOT NULL DEFAULT '#f8f5ef',
  ADD COLUMN "titleFont" TEXT NOT NULL DEFAULT 'cormorant',
  ADD COLUMN "bodyFont" TEXT NOT NULL DEFAULT 'manrope';

CREATE TABLE "Depoimento" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "clientName" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "role" TEXT,
  "avatarUrl" TEXT,
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "Depoimento_isPublished_sortOrder_idx"
  ON "Depoimento"("isPublished", "sortOrder");

CREATE TABLE "MarcoHistorico" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "year" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "MarcoHistorico_sortOrder_idx"
  ON "MarcoHistorico"("sortOrder");

CREATE TABLE "MembroEquipe" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "bio" TEXT,
  "photoUrl" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "MembroEquipe_sortOrder_idx"
  ON "MembroEquipe"("sortOrder");

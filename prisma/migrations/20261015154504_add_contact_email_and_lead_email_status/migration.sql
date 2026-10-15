-- Migration: add_contact_email_and_lead_email_status
-- Gerada com: prisma migrate diff --from-schema-datasource --to-schema-datamodel --script
-- Data migration: contactEmail inicializado com o valor atual de email (se válido)

-- AlterTable: ConfiguracaoSite — adiciona campo separado para e-mail de recebimento de contatos
ALTER TABLE "ConfiguracaoSite" ADD COLUMN "contactEmail" TEXT;

-- Data migration: copia email → contactEmail se for um endereço válido
-- (evita iniciar o campo vazio quando já há um e-mail configurado)
UPDATE "ConfiguracaoSite"
SET "contactEmail" = "email"
WHERE "email" IS NOT NULL
  AND "email" ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$';

-- AlterTable: Lead — campos para controle de envio de e-mail e caixa de entrada
ALTER TABLE "Lead"
  ADD COLUMN "emailError"  TEXT,
  ADD COLUMN "emailStatus" TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN "ipAddress"   TEXT,
  ADD COLUMN "isRead"      BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "readAt"      TIMESTAMP(3);

-- Leads criados antes desta feature nunca tiveram e-mail enviado
-- Marcamos como 'legacy' para distinguir na caixa de entrada
UPDATE "Lead" SET "emailStatus" = 'legacy' WHERE "emailStatus" = 'pending';

-- CreateIndex
CREATE INDEX "Lead_isRead_createdAt_idx" ON "Lead"("isRead", "createdAt");
CREATE INDEX "Lead_emailStatus_idx"      ON "Lead"("emailStatus");

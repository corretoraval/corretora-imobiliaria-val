-- Migration: add_campo_contato_and_custom_fields
-- Permite campos de formulário editáveis, reordenáveis e dinâmicos no admin

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "customFields" JSONB;

-- CreateTable
CREATE TABLE IF NOT EXISTS "CampoContato" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "required" BOOLEAN NOT NULL DEFAULT false,
    "placeholder" TEXT,
    "options" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isProtected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampoContato_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CampoContato_name_key" ON "CampoContato"("name");
CREATE INDEX IF NOT EXISTS "CampoContato_order_isActive_idx" ON "CampoContato"("order", "isActive");

-- Seed inicial dos campos do formulário de contato
INSERT INTO "CampoContato" ("id", "name", "label", "type", "required", "placeholder", "options", "order", "isActive", "isProtected", "createdAt", "updatedAt")
VALUES
  ('campo_nome', 'name', 'Nome completo', 'text', true, 'Seu nome completo', NULL, 0, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('campo_email', 'email', 'E-mail', 'email', true, 'seu@email.com', NULL, 1, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('campo_phone', 'phone', 'Telefone / WhatsApp', 'tel', true, '(47) 99999-9999', NULL, 2, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('campo_subject', 'subject', 'Assunto', 'text', false, 'Sobre o que gostaria de conversar?', NULL, 3, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('campo_message', 'message', 'Mensagem', 'textarea', false, 'Escreva sua mensagem aqui...', NULL, 4, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

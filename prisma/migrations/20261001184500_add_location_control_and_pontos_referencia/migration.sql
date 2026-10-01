-- AlterEnum
ALTER TYPE "VisibilidadeEndereco" ADD VALUE IF NOT EXISTS 'OCULTA';

-- AlterTable
ALTER TABLE "Imovel" ADD COLUMN "pontosReferencia" TEXT;

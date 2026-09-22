ALTER TABLE "Imovel"
ADD COLUMN "guestCapacity" INTEGER,
ADD COLUMN "dailyRateConsultation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "availabilityStart" TIMESTAMP(3),
ADD COLUMN "availabilityEnd" TIMESTAMP(3),
ADD COLUMN "availabilityNotes" TEXT;

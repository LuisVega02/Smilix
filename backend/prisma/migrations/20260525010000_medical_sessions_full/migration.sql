-- Add anamnesis and medicalHistory to existing sessions
ALTER TABLE "medical_sessions"
  ADD COLUMN "anamnesis" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "medicalHistory" TEXT NOT NULL DEFAULT '';

-- Create odontograms table
CREATE TABLE "odontograms" (
  "id" SERIAL PRIMARY KEY,
  "medicalSessionId" INTEGER NOT NULL UNIQUE,
  "data" TEXT NOT NULL,
  "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

ALTER TABLE "odontograms"
  ADD CONSTRAINT "odontograms_medicalSessionId_fkey"
  FOREIGN KEY ("medicalSessionId") REFERENCES "medical_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create BudgetStatus enum type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BudgetStatus') THEN
    CREATE TYPE "BudgetStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
  END IF;
END$$;

-- Create medical budgets table
CREATE TABLE "medical_budgets" (
  "id" SERIAL PRIMARY KEY,
  "medicalSessionId" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "totalCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
  "status" "BudgetStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

ALTER TABLE "medical_budgets"
  ADD CONSTRAINT "medical_budgets_medicalSessionId_fkey"
  FOREIGN KEY ("medicalSessionId") REFERENCES "medical_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

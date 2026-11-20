-- AlterTable
ALTER TABLE "treatments" ADD COLUMN     "faces" TEXT,
ADD COLUMN     "medicalSessionId" INTEGER,
ADD COLUMN     "odontogramId" INTEGER,
ADD COLUMN     "pathologyId" INTEGER,
ADD COLUMN     "treatmentCatalogId" INTEGER;

-- CreateTable
CREATE TABLE "patient_pathologies" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "medicalSessionId" INTEGER,
    "pathologyId" INTEGER NOT NULL,
    "doctorId" INTEGER,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_pathologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_conditions" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "medicalSessionId" INTEGER,
    "medicalConditionId" INTEGER NOT NULL,
    "tooth" TEXT,
    "face" TEXT,
    "dentition" TEXT,
    "cured" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_allergies" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "allergyId" INTEGER NOT NULL,
    "severity" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_allergies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "medicalSessionId" INTEGER,
    "medicationId" INTEGER,
    "medicationName" TEXT,
    "dose" TEXT,
    "frequency" TEXT,
    "duration" TEXT,
    "instructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_acts" (
    "id" SERIAL NOT NULL,
    "treatmentId" INTEGER NOT NULL,
    "procedureCatalogId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedure_acts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "patient_pathologies_patientId_idx" ON "patient_pathologies"("patientId");

-- CreateIndex
CREATE INDEX "patient_pathologies_medicalSessionId_idx" ON "patient_pathologies"("medicalSessionId");

-- CreateIndex
CREATE INDEX "patient_pathologies_pathologyId_idx" ON "patient_pathologies"("pathologyId");

-- CreateIndex
CREATE INDEX "patient_pathologies_doctorId_idx" ON "patient_pathologies"("doctorId");

-- CreateIndex
CREATE INDEX "patient_conditions_patientId_idx" ON "patient_conditions"("patientId");

-- CreateIndex
CREATE INDEX "patient_conditions_medicalSessionId_idx" ON "patient_conditions"("medicalSessionId");

-- CreateIndex
CREATE INDEX "patient_conditions_medicalConditionId_idx" ON "patient_conditions"("medicalConditionId");

-- CreateIndex
CREATE INDEX "patient_allergies_patientId_idx" ON "patient_allergies"("patientId");

-- CreateIndex
CREATE INDEX "patient_allergies_allergyId_idx" ON "patient_allergies"("allergyId");

-- CreateIndex
CREATE UNIQUE INDEX "patient_allergies_patientId_allergyId_key" ON "patient_allergies"("patientId", "allergyId");

-- CreateIndex
CREATE INDEX "prescriptions_patientId_idx" ON "prescriptions"("patientId");

-- CreateIndex
CREATE INDEX "prescriptions_medicalSessionId_idx" ON "prescriptions"("medicalSessionId");

-- CreateIndex
CREATE INDEX "prescriptions_medicationId_idx" ON "prescriptions"("medicationId");

-- CreateIndex
CREATE INDEX "procedure_acts_treatmentId_idx" ON "procedure_acts"("treatmentId");

-- CreateIndex
CREATE INDEX "procedure_acts_procedureCatalogId_idx" ON "procedure_acts"("procedureCatalogId");

-- CreateIndex
CREATE INDEX "treatments_medicalSessionId_idx" ON "treatments"("medicalSessionId");

-- CreateIndex
CREATE INDEX "treatments_treatmentCatalogId_idx" ON "treatments"("treatmentCatalogId");

-- CreateIndex
CREATE INDEX "treatments_pathologyId_idx" ON "treatments"("pathologyId");

-- CreateIndex
CREATE INDEX "treatments_odontogramId_idx" ON "treatments"("odontogramId");

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_medicalSessionId_fkey" FOREIGN KEY ("medicalSessionId") REFERENCES "medical_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_treatmentCatalogId_fkey" FOREIGN KEY ("treatmentCatalogId") REFERENCES "treatment_catalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_pathologyId_fkey" FOREIGN KEY ("pathologyId") REFERENCES "pathologies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_odontogramId_fkey" FOREIGN KEY ("odontogramId") REFERENCES "odontograms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_pathologies" ADD CONSTRAINT "patient_pathologies_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_pathologies" ADD CONSTRAINT "patient_pathologies_medicalSessionId_fkey" FOREIGN KEY ("medicalSessionId") REFERENCES "medical_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_pathologies" ADD CONSTRAINT "patient_pathologies_pathologyId_fkey" FOREIGN KEY ("pathologyId") REFERENCES "pathologies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_pathologies" ADD CONSTRAINT "patient_pathologies_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "physicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_conditions" ADD CONSTRAINT "patient_conditions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_conditions" ADD CONSTRAINT "patient_conditions_medicalSessionId_fkey" FOREIGN KEY ("medicalSessionId") REFERENCES "medical_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_conditions" ADD CONSTRAINT "patient_conditions_medicalConditionId_fkey" FOREIGN KEY ("medicalConditionId") REFERENCES "medical_conditions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_allergies" ADD CONSTRAINT "patient_allergies_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_allergies" ADD CONSTRAINT "patient_allergies_allergyId_fkey" FOREIGN KEY ("allergyId") REFERENCES "allergies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_medicalSessionId_fkey" FOREIGN KEY ("medicalSessionId") REFERENCES "medical_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "medications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_acts" ADD CONSTRAINT "procedure_acts_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "treatments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_acts" ADD CONSTRAINT "procedure_acts_procedureCatalogId_fkey" FOREIGN KEY ("procedureCatalogId") REFERENCES "procedure_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


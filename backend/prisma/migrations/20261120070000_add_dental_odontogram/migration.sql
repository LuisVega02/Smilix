-- AlterTable
ALTER TABLE "odontograms" ADD COLUMN     "doctorId" INTEGER,
ADD COLUMN     "patientId" INTEGER,
ADD COLUMN     "scheduledDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "teeth" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dentition" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tooth" TEXT NOT NULL,
    "face" TEXT,
    "jaw" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teeth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "odontogram_findings" (
    "id" SERIAL NOT NULL,
    "odontogramId" INTEGER NOT NULL,
    "toothId" INTEGER,
    "toothCode" TEXT,
    "face" TEXT,
    "dentition" TEXT,
    "kind" TEXT NOT NULL,
    "medicalConditionId" INTEGER,
    "treatmentCatalogId" INTEGER,
    "pathologyId" INTEGER,
    "notes" TEXT,
    "cured" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "odontogram_findings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "teeth_dentition_idx" ON "teeth"("dentition");

-- CreateIndex
CREATE UNIQUE INDEX "teeth_tooth_dentition_key" ON "teeth"("tooth", "dentition");

-- CreateIndex
CREATE INDEX "odontogram_findings_odontogramId_idx" ON "odontogram_findings"("odontogramId");

-- CreateIndex
CREATE INDEX "odontogram_findings_toothId_idx" ON "odontogram_findings"("toothId");

-- CreateIndex
CREATE INDEX "odontogram_findings_medicalConditionId_idx" ON "odontogram_findings"("medicalConditionId");

-- CreateIndex
CREATE INDEX "odontogram_findings_treatmentCatalogId_idx" ON "odontogram_findings"("treatmentCatalogId");

-- CreateIndex
CREATE INDEX "odontogram_findings_pathologyId_idx" ON "odontogram_findings"("pathologyId");

-- CreateIndex
CREATE INDEX "odontograms_patientId_idx" ON "odontograms"("patientId");

-- CreateIndex
CREATE INDEX "odontograms_doctorId_idx" ON "odontograms"("doctorId");

-- AddForeignKey
ALTER TABLE "odontograms" ADD CONSTRAINT "odontograms_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "odontograms" ADD CONSTRAINT "odontograms_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "physicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "odontogram_findings" ADD CONSTRAINT "odontogram_findings_odontogramId_fkey" FOREIGN KEY ("odontogramId") REFERENCES "odontograms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "odontogram_findings" ADD CONSTRAINT "odontogram_findings_toothId_fkey" FOREIGN KEY ("toothId") REFERENCES "teeth"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "odontogram_findings" ADD CONSTRAINT "odontogram_findings_medicalConditionId_fkey" FOREIGN KEY ("medicalConditionId") REFERENCES "medical_conditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "odontogram_findings" ADD CONSTRAINT "odontogram_findings_treatmentCatalogId_fkey" FOREIGN KEY ("treatmentCatalogId") REFERENCES "treatment_catalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "odontogram_findings" ADD CONSTRAINT "odontogram_findings_pathologyId_fkey" FOREIGN KEY ("pathologyId") REFERENCES "pathologies"("id") ON DELETE SET NULL ON UPDATE CASCADE;


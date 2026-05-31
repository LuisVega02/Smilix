/*
  Warnings:

  - You are about to drop the column `allergies` on the `medical_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `bloodPressure` on the `medical_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `clinicalHistoryId` on the `medical_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `heartRate` on the `medical_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `informedConsent` on the `medical_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `observations` on the `medical_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `prescriptions` on the `medical_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `respiratoryRate` on the `medical_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `temperature` on the `medical_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `allergies` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `medicalHistory` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the `clinical_histories` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `patientId` to the `medical_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "clinical_histories" DROP CONSTRAINT "clinical_histories_patientId_fkey";

-- DropForeignKey
ALTER TABLE "medical_sessions" DROP CONSTRAINT "medical_sessions_clinicalHistoryId_fkey";

-- AlterTable
ALTER TABLE "medical_sessions" DROP COLUMN "allergies",
DROP COLUMN "bloodPressure",
DROP COLUMN "clinicalHistoryId",
DROP COLUMN "heartRate",
DROP COLUMN "informedConsent",
DROP COLUMN "observations",
DROP COLUMN "prescriptions",
DROP COLUMN "respiratoryRate",
DROP COLUMN "temperature",
ADD COLUMN     "patientId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "patients" DROP COLUMN "allergies",
DROP COLUMN "medicalHistory",
ADD COLUMN     "anamnesis" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "dentalDevelopment" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "guardianDocumentId" TEXT,
ADD COLUMN     "guardianEmail" TEXT,
ADD COLUMN     "guardianFullName" TEXT,
ADD COLUMN     "guardianPhone" TEXT,
ADD COLUMN     "guardianPhotoUrl" TEXT,
ADD COLUMN     "guardianRelationship" TEXT,
ADD COLUMN     "medicalBackground" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "oralHabits" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "patientPhotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "postnatalBackground" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "prenatalBackground" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "radiographs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "status" "ClinicalHistoryStatus" NOT NULL DEFAULT 'DRAFT';

-- DropTable
DROP TABLE "clinical_histories";

-- AddForeignKey
ALTER TABLE "medical_sessions" ADD CONSTRAINT "medical_sessions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

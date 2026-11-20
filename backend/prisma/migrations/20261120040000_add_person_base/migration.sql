-- AlterTable
ALTER TABLE "appointments" ALTER COLUMN "doctorResponsible" DROP DEFAULT;

-- AlterTable
ALTER TABLE "medical_budgets" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "odontograms" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "personId" INTEGER;

-- CreateTable
CREATE TABLE "persons" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastNameFather" TEXT NOT NULL,
    "lastNameMother" TEXT,
    "docType" TEXT,
    "docNumber" TEXT,
    "birthDate" TIMESTAMP(3),
    "gender" TEXT,
    "email" TEXT,
    "phones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "address" TEXT,
    "photoUrl" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "legalParentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT,
    "color" TEXT,

    CONSTRAINT "person_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "physicians" (
    "id" SERIAL NOT NULL,
    "personId" INTEGER NOT NULL,
    "name" TEXT,
    "registerRnp" TEXT,
    "registerRne" TEXT,
    "isManager" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "physicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PersonToPersonTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PersonToPersonTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "persons_docNumber_key" ON "persons"("docNumber");

-- CreateIndex
CREATE UNIQUE INDEX "persons_email_key" ON "persons"("email");

-- CreateIndex
CREATE UNIQUE INDEX "person_tags_name_key" ON "person_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "facilities_code_key" ON "facilities"("code");

-- CreateIndex
CREATE UNIQUE INDEX "physicians_personId_key" ON "physicians"("personId");

-- CreateIndex
CREATE INDEX "_PersonToPersonTag_B_index" ON "_PersonToPersonTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "patients_personId_key" ON "patients"("personId");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_legalParentId_fkey" FOREIGN KEY ("legalParentId") REFERENCES "persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "physicians" ADD CONSTRAINT "physicians_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PersonToPersonTag" ADD CONSTRAINT "_PersonToPersonTag_A_fkey" FOREIGN KEY ("A") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PersonToPersonTag" ADD CONSTRAINT "_PersonToPersonTag_B_fkey" FOREIGN KEY ("B") REFERENCES "person_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;


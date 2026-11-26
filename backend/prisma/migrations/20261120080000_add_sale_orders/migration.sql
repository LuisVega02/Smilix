-- CreateTable
CREATE TABLE "sale_orders" (
    "id" SERIAL NOT NULL,
    "code" TEXT,
    "patientId" INTEGER NOT NULL,
    "medicalSessionId" INTEGER,
    "odontogramId" INTEGER,
    "doctorId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "installmentsCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sale_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_order_lines" (
    "id" SERIAL NOT NULL,
    "saleOrderId" INTEGER NOT NULL,
    "description" TEXT,
    "pathologyId" INTEGER,
    "treatmentCatalogId" INTEGER,
    "treatmentId" INTEGER,
    "medicalSessionId" INTEGER,
    "odontogramId" INTEGER,
    "tooth" TEXT,
    "faces" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sale_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installment_payments" (
    "id" SERIAL NOT NULL,
    "saleOrderId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3),
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "installment_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sale_orders_code_key" ON "sale_orders"("code");

-- CreateIndex
CREATE INDEX "sale_orders_patientId_idx" ON "sale_orders"("patientId");

-- CreateIndex
CREATE INDEX "sale_orders_medicalSessionId_idx" ON "sale_orders"("medicalSessionId");

-- CreateIndex
CREATE INDEX "sale_orders_odontogramId_idx" ON "sale_orders"("odontogramId");

-- CreateIndex
CREATE INDEX "sale_orders_doctorId_idx" ON "sale_orders"("doctorId");

-- CreateIndex
CREATE INDEX "sale_orders_status_idx" ON "sale_orders"("status");

-- CreateIndex
CREATE INDEX "sale_order_lines_saleOrderId_idx" ON "sale_order_lines"("saleOrderId");

-- CreateIndex
CREATE INDEX "sale_order_lines_pathologyId_idx" ON "sale_order_lines"("pathologyId");

-- CreateIndex
CREATE INDEX "sale_order_lines_treatmentCatalogId_idx" ON "sale_order_lines"("treatmentCatalogId");

-- CreateIndex
CREATE INDEX "sale_order_lines_treatmentId_idx" ON "sale_order_lines"("treatmentId");

-- CreateIndex
CREATE INDEX "sale_order_lines_medicalSessionId_idx" ON "sale_order_lines"("medicalSessionId");

-- CreateIndex
CREATE INDEX "sale_order_lines_odontogramId_idx" ON "sale_order_lines"("odontogramId");

-- CreateIndex
CREATE INDEX "installment_payments_saleOrderId_idx" ON "installment_payments"("saleOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "installment_payments_saleOrderId_number_key" ON "installment_payments"("saleOrderId", "number");

-- AddForeignKey
ALTER TABLE "sale_orders" ADD CONSTRAINT "sale_orders_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_orders" ADD CONSTRAINT "sale_orders_medicalSessionId_fkey" FOREIGN KEY ("medicalSessionId") REFERENCES "medical_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_orders" ADD CONSTRAINT "sale_orders_odontogramId_fkey" FOREIGN KEY ("odontogramId") REFERENCES "odontograms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_orders" ADD CONSTRAINT "sale_orders_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "physicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_order_lines" ADD CONSTRAINT "sale_order_lines_saleOrderId_fkey" FOREIGN KEY ("saleOrderId") REFERENCES "sale_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_order_lines" ADD CONSTRAINT "sale_order_lines_pathologyId_fkey" FOREIGN KEY ("pathologyId") REFERENCES "pathologies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_order_lines" ADD CONSTRAINT "sale_order_lines_treatmentCatalogId_fkey" FOREIGN KEY ("treatmentCatalogId") REFERENCES "treatment_catalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_order_lines" ADD CONSTRAINT "sale_order_lines_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "treatments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_order_lines" ADD CONSTRAINT "sale_order_lines_medicalSessionId_fkey" FOREIGN KEY ("medicalSessionId") REFERENCES "medical_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_order_lines" ADD CONSTRAINT "sale_order_lines_odontogramId_fkey" FOREIGN KEY ("odontogramId") REFERENCES "odontograms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installment_payments" ADD CONSTRAINT "installment_payments_saleOrderId_fkey" FOREIGN KEY ("saleOrderId") REFERENCES "sale_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;


import { Module } from '@nestjs/common';
import { Cie10Controller } from './controllers/cie10.controller';
import { PathologiesController } from './controllers/pathologies.controller';
import { MedicalConditionsController } from './controllers/medical-conditions.controller';
import { TreatmentCatalogController } from './controllers/treatment-catalog.controller';
import { ProcedureCatalogController } from './controllers/procedure-catalog.controller';
import { MedicationsController } from './controllers/medications.controller';
import { AllergiesController } from './controllers/allergies.controller';
import { ExamTypesController } from './controllers/exam-types.controller';
import { Cie10Service } from './services/cie10.service';
import { PathologiesService } from './services/pathologies.service';
import { MedicalConditionsService } from './services/medical-conditions.service';
import { TreatmentCatalogService } from './services/treatment-catalog.service';
import { ProcedureCatalogService } from './services/procedure-catalog.service';
import { MedicationsService } from './services/medications.service';
import { AllergiesService } from './services/allergies.service';
import { ExamTypesService } from './services/exam-types.service';

/**
 * Catálogos clínicos (F3): CIE-10, patologías, condiciones médicas,
 * tratamientos, procedimientos, medicamentos, alergias y tipos de examen.
 *
 * PrismaService es global (PrismaModule), por lo que no se reimporta aquí.
 * Todas las rutas quedan protegidas por el JwtAuthGuard global.
 */
@Module({
  controllers: [
    Cie10Controller,
    PathologiesController,
    MedicalConditionsController,
    TreatmentCatalogController,
    ProcedureCatalogController,
    MedicationsController,
    AllergiesController,
    ExamTypesController,
  ],
  providers: [
    Cie10Service,
    PathologiesService,
    MedicalConditionsService,
    TreatmentCatalogService,
    ProcedureCatalogService,
    MedicationsService,
    AllergiesService,
    ExamTypesService,
  ],
})
export class CatalogsModule {}

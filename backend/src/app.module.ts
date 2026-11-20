import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { ClinicalHistoryModule } from './modules/clinical-history/clinical-history.module';
import { MedicalSessionsModule } from './modules/medical-sessions/medical-sessions.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { TreatmentsModule } from './modules/treatments/treatments.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CatalogsModule } from './modules/catalogs/catalogs.module';
import { PatientPathologiesModule } from './modules/patient-pathologies/patient-pathologies.module';
import { PatientConditionsModule } from './modules/patient-conditions/patient-conditions.module';
import { PatientAllergiesModule } from './modules/patient-allergies/patient-allergies.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { ProcedureActsModule } from './modules/procedure-acts/procedure-acts.module';
import { TeethModule } from './modules/teeth/teeth.module';
import { OdontogramsModule } from './modules/odontograms/odontograms.module';
import { SaleOrdersModule } from './modules/sale-orders/sale-orders.module';
import { PrismaModule } from './prisma/prisma.module';

/**
 * Sin JWT_SECRET el servidor NO debe arrancar: un secreto ausente o por
 * defecto permitiría firmar/verificar tokens de forma insegura.
 */
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error(
    'JWT_SECRET no está configurada. El servidor no arrancará sin un secreto JWT seguro.',
  );
}

@Module({
  /**
   * IMPORTS: Módulos secundarios del sistema
   *
   * JwtModule.register({ global: true }) expone JwtService en toda la app
   * (AuthService, JwtAuthGuard, etc.) sin reimportarlo en cada módulo.
   */
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: jwtSecret,
      signOptions: { expiresIn: (process.env.JWT_EXPIRATION || '7d') as any },
    }),
    AuthModule,
    ClinicalHistoryModule,
    MedicalSessionsModule,
    AppointmentsModule,
    TreatmentsModule,
    PaymentsModule,
    CatalogsModule,
    PatientPathologiesModule,
    PatientConditionsModule,
    PatientAllergiesModule,
    PrescriptionsModule,
    ProcedureActsModule,
    TeethModule,
    OdontogramsModule,
    SaleOrdersModule,
  ],

  /**
   * CONTROLLERS: Controladores globales
   *
   * AppController es el controlador raíz que responde
   * a GET / y GET /health (marcados como @Public).
   */
  controllers: [AppController],

  /**
   * PROVIDERS: Servicios globales disponibles en toda la app
   *
   * APP_GUARD registra JwtAuthGuard como guard global: toda ruta requiere
   * un JWT válido salvo que esté decorada con @Public().
   */
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

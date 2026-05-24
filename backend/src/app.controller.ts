import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): { message: string; version: string; status: string } {
    return {
      message: 'Sistema de Gestión para Clínica Dental - Backend API',
      version: '2.0.0',
      status: 'Running',
    };
  }

  @Get('health')
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ClinicalHistoryService } from './clinical-history.service';
import { CreateClinicalHistoryDto } from './dto/create-clinical-history.dto';
import { UpdateClinicalHistoryDto } from './dto/update-clinical-history.dto';
import { Request } from 'express';

const patientPhotoUploadPath = join(process.cwd(), 'uploads', 'patient-photos');

if (!existsSync(patientPhotoUploadPath)) {
  mkdirSync(patientPhotoUploadPath, { recursive: true });
}

const sanitizeFileName = (fileName: string) =>
  fileName
    .normalize('NFD')
    .replace(/[^a-zA-Z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

@Controller('clinical-histories')
export class ClinicalHistoryController {
  constructor(private readonly clinicalHistoryService: ClinicalHistoryService) {}

  @Get()
  findAll() {
    return this.clinicalHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clinicalHistoryService.findOne(id);
  }

  @Post()
  create(@Body() createClinicalHistoryDto: CreateClinicalHistoryDto) {
    return this.clinicalHistoryService.create(createClinicalHistoryDto);
  }

  @Post('upload/patient-photo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: patientPhotoUploadPath,
        filename: (
          _: Request,
          file: Express.Multer.File,
          callback: (error: Error | null, filename: string) => void,
        ) => {
          const extension = extname(file.originalname) || '.jpg';
          const baseName = sanitizeFileName(file.originalname.replace(extension, ''));
          callback(null, `${Date.now()}-${baseName}${extension}`);
        },
      }),
      fileFilter: (
        _: Request,
        file: Express.Multer.File,
        callback: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(null, false);
          return;
        }

        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadPatientPhoto(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestException('Debe adjuntar una imagen');
    }

    return {
      fileName: file.filename,
      relativePath: `/uploads/patient-photos/${file.filename}`,
    };
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClinicalHistoryDto: UpdateClinicalHistoryDto,
  ) {
    return this.clinicalHistoryService.update(id, updateClinicalHistoryDto);
  }
}
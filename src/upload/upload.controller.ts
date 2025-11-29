import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig, imageFileFilter ,pdfFileFilter,excelFileFilter,} from './multer.config';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // ----------------------
  // IMAGE UPLOAD
  // ----------------------
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      ...multerConfig,
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    const url = this.uploadService.getPublicUrl(file.filename);
    return {
      filename: file.filename,
      url,
    };
  }

   // ----------------------
  // PDF UPLOAD
  // ----------------------
  @Post('pdf')
  @UseInterceptors(
    FileInterceptor('file', {
      ...multerConfig,
      fileFilter: pdfFileFilter,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
  uploadPdf(@UploadedFile() file: Express.Multer.File) {
    const url = this.uploadService.getPublicUrl(file.filename);
    return { filename: file.filename, url };
  }

  // ----------------------
  // EXCEL UPLOAD
  // ----------------------
  @Post('excel')
  @UseInterceptors(
    FileInterceptor('file', {
      ...multerConfig,
      fileFilter: excelFileFilter,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
  uploadExcel(@UploadedFile() file: Express.Multer.File) {
    const url = this.uploadService.getPublicUrl(file.filename);
    return { filename: file.filename, url };
  }

  
}

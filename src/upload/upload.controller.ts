import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig, imageFileFilter } from './multer.config';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      ...multerConfig,
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  // uploadImage(@UploadedFile() file: Express.Multer.File) {
  //   const url = this.uploadService.getPublicUrl(file.filename);

  //   return {
  //     filename: file.filename,
  //     url,
  //   };
  // }
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    const url = this.uploadService.getPublicUrl(file.filename);
  
    return {
      filename: file.filename,
      url,
    };
  }
  
}

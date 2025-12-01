import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  getPublicUrl(filename: string): string {
    const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3003}`;
    return `${appUrl}/uploads/${filename}`;
  }
}
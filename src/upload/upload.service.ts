import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  getPublicUrl(filename: string): string {
    const appUrl = process.env.APP_URL}`;
    return `${appUrl}/uploads/${filename}`;
  }
}

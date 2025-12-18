import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as bodyParser from "body-parser";
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;

  // FIX: Now useStaticAssets works
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  app.use(
    "/payments/webhook",
    bodyParser.raw({ type: "application/json" }),
  );

  await app.listen(port);
  console.log("Server started at:", new Date().toString());
  console.log(`Server running on port ${port}`);
}

bootstrap();

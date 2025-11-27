import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { MailsModule } from '../mails/mails.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [MailsModule],
  providers: [CronService, PrismaService],
})
export class CronModule {}

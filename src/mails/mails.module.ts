import { Module } from '@nestjs/common';
import { MailService } from './mails.service';
import { MailController } from './mails.controller';

@Module({
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailsModule {}

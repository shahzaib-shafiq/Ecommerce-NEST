import { Module } from '@nestjs/common';
import { CoupansService } from './coupans.service';
import { CoupansController } from './coupans.controller';

@Module({
  controllers: [CoupansController],
  providers: [CoupansService],
})
export class CoupansModule {}

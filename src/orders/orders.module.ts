import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MailsModule } from '../mails/mails.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [MailsModule],
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService],
  exports: [OrdersService, OrdersModule],
})
export class OrdersModule {}

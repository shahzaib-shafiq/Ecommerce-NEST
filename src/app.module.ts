import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StoresModule } from './stores/stores.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentModule } from './payment/payment.module';
import { ShippingModule } from './shipping/shipping.module';
import { CoupansModule } from './coupans/coupans.module';
import { AddressModule } from './address/address.module';
import { MailsModule } from './mails/mails.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './cron/cron.module';
import { CategoryModule } from './category/category.module';
import { UploadModule } from './upload/upload.module';
// import other modules

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true, // makes config available everywhere
      envFilePath: '.env', // explicitly specify .env file path
      expandVariables: true, // enable variable expansion in .env
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    StoresModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentModule,
    CoupansModule,
    ShippingModule,
    AddressModule,
    MailsModule,
    CronModule,
    CategoryModule,
    UploadModule,
    
    // other modules...
  ],
})
export class AppModule {}

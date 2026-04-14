import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
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
import { PdfModule } from './pdf/pdf.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('7d'),
        PORT: Joi.number().default(3000),
        APP_URL: Joi.string().default('http://localhost:3000'),
        STRIPE_SECRET_KEY: Joi.string().allow('').default(''),
        STRIPE_WEBHOOK_SECRET: Joi.string().allow('').default(''),
        MAIL_HOST: Joi.string().allow('').default(''),
        MAIL_PORT: Joi.number().default(587),
        MAIL_USER: Joi.string().allow('').default(''),
        MAIL_PASS: Joi.string().allow('').default(''),
        MAIL_FROM: Joi.string().allow('').default(''),
        CORS_ORIGINS: Joi.string().optional(),
      }),
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
    PdfModule,
    PaymentsModule,
  ],
})
export class AppModule {}

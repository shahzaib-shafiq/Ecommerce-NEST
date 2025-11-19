import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StoresModule } from './stores/stores.module';
import { ProductsModule } from './products/products.module';
// import other modules

@Module({
  imports: [
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
    
    // other modules...
  ],
})
export class AppModule {}

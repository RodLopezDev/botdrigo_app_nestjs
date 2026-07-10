import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';

import { AppService } from './app.service';
import { AppController } from './app.controller';
// import { dataSourceOptions } from './config/data-source';

// import { AuthModule } from './modules/auth/auth.module';
// import { TenantModule } from './modules/tenant/tenant.module';
// import { CatalogModule } from './modules/catalog/catalog.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // TypeOrmModule.forRoot(dataSourceOptions),
    // AuthModule,
    // TenantModule,
    // CatalogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

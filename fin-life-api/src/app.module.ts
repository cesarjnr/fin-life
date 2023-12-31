import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { assetPricesProviderConfig } from './config/assetPricesProvider.config';
import { dataSource } from '../database/datasource';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { AssetsModule } from './assets/assets.module';
import { WalletsModule } from './wallets/wallets.module';
import { AssetHistoricalPricesModule } from './assetHistoricalPrices/assetHistoricalPrices.module';
import { AssetDataProviderModule } from './assetPricesProvider/assetDataProvider.module';
import { BuysSellsModule } from './buysSells/buysSells.module';
import { WalletsAssetsModule } from './walletsAssets/walletsAssets.module';
import { DividendHistoricalPaymentsModule } from './dividendHistoricalPayments/dividendHistoricalPayments.module';
import { SplitHistoricalEventsModule } from './splitHistoricalEvents/splitHistoricalEvents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [assetPricesProviderConfig]
    }),
    TypeOrmModule.forRoot(dataSource.options),
    ScheduleModule.forRoot(),
    CommonModule,
    UsersModule,
    AssetsModule,
    WalletsModule,
    AssetHistoricalPricesModule,
    AssetDataProviderModule,
    BuysSellsModule,
    WalletsAssetsModule,
    DividendHistoricalPaymentsModule,
    SplitHistoricalEventsModule
  ],
  providers: [
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ClassSerializerInterceptor
    }
  ]
})
export class AppModule {}

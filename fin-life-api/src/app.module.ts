import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { assetPricesProviderConfig } from './config/assetPricesProvider.config';
import { dataSource } from '../database/datasource';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { AssetsModule } from './assets/assets.module';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { AssetHistoricalPricesModule } from './assetHistoricalPrices/assetHistoricalPrices.module';
import { AssetDataProviderModule } from './assetDataProvider/assetDataProvider.module';
import { BuysSellsModule } from './buysSells/buysSells.module';
import { PortfoliosAssetsModule } from './portfoliosAssets/portfoliosAssets.module';
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
    PortfoliosModule,
    AssetHistoricalPricesModule,
    AssetDataProviderModule,
    BuysSellsModule,
    PortfoliosAssetsModule,
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

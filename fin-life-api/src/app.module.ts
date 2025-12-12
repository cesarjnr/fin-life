import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { assetPricesProviderConfig } from './config/marketDataProvider.config';
import { dataSource } from '../database/datasource';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { AssetsModule } from './assets/assets.module';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { AssetHistoricalPricesModule } from './assetHistoricalPrices/assetHistoricalPrices.module';
import { MarketDataProviderModule } from './marketDataProvider/marketDataProvider.module';
import { BuysSellsModule } from './buysSells/buysSells.module';
import { PortfoliosAssetsModule } from './portfoliosAssets/portfoliosAssets.module';
import { DividendHistoricalPaymentsModule } from './dividendHistoricalPayments/dividendHistoricalPayments.module';
import { SplitHistoricalEventsModule } from './splitHistoricalEvents/splitHistoricalEvents.module';
import { MarketIndexHistoricalDataModule } from './marketIndexHistoricalData/marketIndexHistoricalData.module';
import { PayoutsModule } from './payouts/payouts.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { ChartsModule } from './charts/charts.module';
import { CommentsModule } from './comments/comments.module';

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
    MarketDataProviderModule,
    BuysSellsModule,
    PortfoliosAssetsModule,
    DividendHistoricalPaymentsModule,
    SplitHistoricalEventsModule,
    MarketIndexHistoricalDataModule,
    PayoutsModule,
    FilesModule,
    AuthModule,
    ChartsModule,
    CommentsModule
  ],
  providers: [
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ClassSerializerInterceptor
    }
  ]
})
export class AppModule {}

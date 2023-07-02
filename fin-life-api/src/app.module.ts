import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { assetPricesProviderConfig } from './config/assetPricesProvider.config';
import { dataSource } from '../database/datasource';
import { UsersModule } from './users/users.module';
import { ExpenseCategoriesModule } from './expenseCategories/expenseCategories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { RevenuesModule } from './revenues/revenues.module';
import { AssetsModule } from './assets/assets.module';
import { WalletsModule } from './wallets/wallets.module';
import { AssetHistoricalPricesModule } from './assetHistoricalPrices/assetHistoricalPrices.module';
import { AssetPricesProviderModule } from './assetPricesProvider/assetPricesProvider.module';
import { BuysSellsModule } from './buysSells/buysSells.module';
import { WalletsAssetsModule } from './walletsAssets/walletsAssets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [assetPricesProviderConfig]
    }),
    TypeOrmModule.forRoot(dataSource.options),
    ScheduleModule.forRoot(),
    UsersModule,
    ExpenseCategoriesModule,
    ExpensesModule,
    RevenuesModule,
    AssetsModule,
    WalletsModule,
    AssetHistoricalPricesModule,
    AssetPricesProviderModule,
    BuysSellsModule,
    WalletsAssetsModule
  ],
  providers: [
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ClassSerializerInterceptor
    }
  ]
})
export class AppModule {}

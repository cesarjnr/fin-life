import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnectionOptions } from 'typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { UsersModule } from './users/users.module';
import { ExpenseCategoriesModule } from './expenseCategories/expenseCategories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { RevenuesModule } from './revenues/revenues.module';
import { AssetsModule } from './assets/assets.module';
import { WalletsModule } from './wallets/wallets.module';
import { AssetHistoricalPricesModule } from './assetHistoricalPrices/assetHistoricalPrices.module';
import { AssetPricesProviderModule } from './assetPricesProvider/assetPricesProvider.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () =>
        Object.assign(await getConnectionOptions(), {
          autoLoadEntities: true
        })
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    ExpenseCategoriesModule,
    ExpensesModule,
    RevenuesModule,
    AssetsModule,
    WalletsModule,
    AssetHistoricalPricesModule,
    AssetPricesProviderModule
  ],
  providers: [
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ClassSerializerInterceptor
    }
  ]
})
export class AppModule {}

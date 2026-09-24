import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PortfoliosController } from './portfolios.controller';
import { PortfoliosService } from './portfolios.service';
import { Portfolio } from './portfolio.entity';
import { UsersModule } from '../users/users.module';
import { AssetsModule } from '../assets/assets.module';
import { PortfolioOwnershipGuard } from './portfolio-ownership.guard';

@Module({
  controllers: [PortfoliosController],
  exports: [PortfoliosService, PortfolioOwnershipGuard],
  imports: [TypeOrmModule.forFeature([Portfolio]), AssetsModule, UsersModule],
  providers: [PortfoliosService, PortfolioOwnershipGuard]
})
export class PortfoliosModule {}

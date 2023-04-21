import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AssetsController } from './assets.controller';
import { Asset } from './asset.entity';
import { AssetsService } from './assets.service';

@Module({
  controllers: [AssetsController],
  imports: [TypeOrmModule.forFeature([Asset])],
  providers: [AssetsService]
})
export class AssetsModule {}

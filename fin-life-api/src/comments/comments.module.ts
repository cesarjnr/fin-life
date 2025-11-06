import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommentsController } from './comments.controller';
import { Comment } from './comment.entity';
import { PortfoliosAssetsModule } from '../portfoliosAssets/portfoliosAssets.module';
import { CommentsService } from './comments.service';

@Module({
  controllers: [CommentsController],
  imports: [TypeOrmModule.forFeature([Comment]), PortfoliosAssetsModule],
  providers: [CommentsService]
})
export class CommentsModule {}

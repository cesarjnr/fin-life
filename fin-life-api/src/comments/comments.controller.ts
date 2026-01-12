import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

import { Comment } from './comment.entity';
import { CreateCommentDto, UpdateCommentDto } from './comments.dto';
import { CommentsService } from './comments.service';
import { GetRequestResponse } from '../common/dto/request';

@Controller('portfolios-assets/:portfolioAssetId/comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post()
  public async create(
    @Param('portfolioAssetId', ParseIntPipe) portfolioAssetId: number,
    @Body() createCommentDto: CreateCommentDto
  ): Promise<Comment> {
    return await this.commentsService.create(portfolioAssetId, createCommentDto);
  }

  @Get()
  public async get(
    @Param('portfolioAssetId', ParseIntPipe) portfolioAssetId: number
  ): Promise<GetRequestResponse<Comment>> {
    return await this.commentsService.get({ portfolioAssetId });
  }

  @Get(':id')
  public async find(@Param('id', ParseIntPipe) id: number): Promise<Comment> {
    return await this.commentsService.find(id);
  }

  @Patch(':id')
  public async update(@Param('id', ParseIntPipe) id, @Body() updateCommentDto: UpdateCommentDto): Promise<Comment> {
    return await this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  public async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.commentsService.delete(id);
  }
}

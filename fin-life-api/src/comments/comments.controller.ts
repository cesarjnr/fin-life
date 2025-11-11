import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

import { Comment } from './comment.entity';
import { CreateCommentDto, UpdateCommentDto } from './comments.dto';
import { CommentsService } from './comments.service';
import { GetRequestResponse } from '../common/dto/request';

@Controller('portfolios/:portfolioId/assets/:assetId/comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post()
  public async create(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Param('assetId', ParseIntPipe) assetId: number,
    @Body() createCommentDto: CreateCommentDto
  ): Promise<Comment> {
    return await this.commentsService.create(portfolioId, assetId, createCommentDto);
  }

  @Get()
  public async get(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Param('assetId', ParseIntPipe) assetId: number
  ): Promise<GetRequestResponse<Comment>> {
    return await this.commentsService.get({ portfolioId, assetId });
  }

  @Get(':id')
  public async find(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Param('assetId', ParseIntPipe) assetId: number,
    @Param('id', ParseIntPipe) id: number
  ): Promise<Comment> {
    return await this.commentsService.find(portfolioId, assetId, id);
  }

  @Patch(':id')
  public async update(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Param('assetId', ParseIntPipe) assetId: number,
    @Param('id', ParseIntPipe) id,
    @Body() updateCommentDto: UpdateCommentDto
  ): Promise<Comment> {
    return await this.commentsService.update(portfolioId, assetId, id, updateCommentDto);
  }

  @Delete(':id')
  public async delete(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Param('assetId', ParseIntPipe) assetId: number,
    @Param('id', ParseIntPipe) id: number
  ): Promise<void> {
    return await this.commentsService.delete(portfolioId, assetId, id);
  }
}

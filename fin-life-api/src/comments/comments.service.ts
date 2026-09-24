import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment } from './comment.entity';
import { PortfoliosAssetsService } from '../portfoliosAssets/portfoliosAssets.service';
import { CreateCommentDto, GetCommentsDto, UpdateCommentDto } from './comments.dto';
import { GetRequestResponse } from '../common/dto/request';
import { normalizePaginationParams } from '../common/helpers/request.helper';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private readonly commentsRepository: Repository<Comment>,
    private readonly portfoliosAssetsService: PortfoliosAssetsService
  ) {}

  public async create(portfolioAssetId: number, createCommentDto: CreateCommentDto): Promise<Comment> {
    const portfolioAsset = await this.portfoliosAssetsService.find(portfolioAssetId);
    const comment = new Comment(portfolioAsset.id, createCommentDto.text);

    await this.commentsRepository.save(comment);

    return comment;
  }

  public async get(getCommentsDto: GetCommentsDto): Promise<GetRequestResponse<Comment>> {
    const { page, limit, orderByColumn, orderBy } = normalizePaginationParams(
      getCommentsDto || {},
      'comment',
      'createdAt',
      ['id', 'text', 'createdAt', 'updatedAt']
    );
    const portfolioAsset = await this.portfoliosAssetsService.find(getCommentsDto.portfolioAssetId);
    const builder = this.commentsRepository
      .createQueryBuilder('comment')
      .where('comment.portfolio_asset_id = :portfolioAssetId', { portfolioAssetId: portfolioAsset.id })
      .orderBy(orderByColumn, orderBy);

    if (page !== null && limit !== null) {
      builder.skip(page * limit).take(limit);
    }

    const comments = await builder.getMany();
    const total = await builder.getCount();

    return {
      data: comments,
      itemsPerPage: limit,
      page,
      total
    };
  }

  public async update(id: number, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.find(id);
    const updatedComment = this.commentsRepository.merge(Object.assign({}, comment), updateCommentDto);

    await this.commentsRepository.save(updatedComment);

    return updatedComment;
  }

  public async delete(id: number): Promise<void> {
    const comment = await this.find(id);

    await this.commentsRepository.delete(comment.id);
  }

  public async find(id: number): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({ where: { id } });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }
}

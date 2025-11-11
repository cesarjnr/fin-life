import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment } from './comment.entity';
import { PortfoliosAssetsService } from '../portfoliosAssets/portfoliosAssets.service';
import { CreateCommentDto, GetCommentsDto, UpdateCommentDto } from './comments.dto';
import { GetRequestResponse, OrderBy } from '../common/dto/request';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private readonly commentsRepository: Repository<Comment>,
    private readonly portfoliosAssetsService: PortfoliosAssetsService
  ) {}

  public async create(portfolioId: number, assetId: number, createCommentDto: CreateCommentDto): Promise<Comment> {
    const portfolioAsset = await this.portfoliosAssetsService.find({ portfolioId, assetId });
    const comment = new Comment(portfolioAsset.id, createCommentDto.text);

    await this.commentsRepository.save(comment);

    return comment;
  }

  public async get(getCommentsDto: GetCommentsDto): Promise<GetRequestResponse<Comment>> {
    const page: number | null = getCommentsDto?.page ? Number(getCommentsDto.page) : null;
    const limit: number | null =
      getCommentsDto?.limit && getCommentsDto.limit !== '0' ? Number(getCommentsDto.limit) : null;
    const orderByColumn = `comment.${getCommentsDto.orderByColumn ?? 'created_at'}`;
    const orderBy = getCommentsDto.orderBy ?? OrderBy.Asc;
    const portfolioAsset = await this.portfoliosAssetsService.find({
      portfolioId: getCommentsDto.portfolioId,
      assetId: getCommentsDto.assetId
    });
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

  public async update(
    portfolioId: number,
    assetId: number,
    id: number,
    updateCommentDto: UpdateCommentDto
  ): Promise<Comment> {
    const comment = await this.find(portfolioId, assetId, id);
    const updatedComment = this.commentsRepository.merge(Object.assign({}, comment), updateCommentDto);

    await this.commentsRepository.save(updatedComment);

    return updatedComment;
  }

  public async delete(portfolioId: number, assetId: number, id: number): Promise<void> {
    const comment = await this.find(portfolioId, assetId, id);

    await this.commentsRepository.delete(comment.id);
  }

  public async find(portfolioId: number, assetId: number, id: number): Promise<Comment> {
    const portfolioAsset = await this.portfoliosAssetsService.find({ portfolioId, assetId });
    const comment = await this.commentsRepository.findOne({ where: { portfolioAssetId: portfolioAsset.id, id } });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }
}

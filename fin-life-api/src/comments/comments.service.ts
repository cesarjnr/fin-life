import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment } from './comment.entity';
import { PortfoliosAssetsService } from '../portfoliosAssets/portfoliosAssets.service';
import { CreateCommentDto, UpdateCommentDto } from './comments.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private readonly commentsRepository: Repository<Comment>,
    private readonly portfoliosAssetsService: PortfoliosAssetsService
  ) {}

  public async create(portfolioAssetId: number, createCommentDto: CreateCommentDto): Promise<Comment> {
    const portfolioAsset = await this.portfoliosAssetsService.find({ id: portfolioAssetId });
    const comment = new Comment(portfolioAsset.id, createCommentDto.text);

    await this.commentsRepository.save(comment);

    return comment;
  }

  public async get(portfolioAssetId: number): Promise<Comment[]> {
    const comments = await this.commentsRepository.find({ where: { portfolioAssetId } });

    return comments;
  }

  public async update(portfolioAssetId: number, id: number, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.find(portfolioAssetId, id);
    const updatedComment = this.commentsRepository.merge(Object.assign({}, comment), updateCommentDto);

    await this.commentsRepository.save(updatedComment);

    return updatedComment;
  }

  public async delete(portfolioAssetId: number, id: number): Promise<void> {
    const comment = await this.find(portfolioAssetId, id);

    await this.commentsRepository.delete(comment);
  }

  public async find(portfolioAssetId: number, id: number): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({ where: { portfolioAssetId, id } });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }
}

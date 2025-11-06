import { IsOptional, IsString } from 'class-validator';
import { GetRequestParams } from 'src/common/dto/request';

export class CreateCommentDto {
  @IsString()
  readonly text: string;
}

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  readonly text: string;
}

export type GetCommentsDto = GetRequestParams & {
  portfolioAssetId?: number;
};

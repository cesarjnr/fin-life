export interface CreateCommentDto {
  text: string;
}

export interface Comment {
  id: number;
  text: string;
  portfolioAssetId: number;
  createdAt: string;
  updatedAt: string;
}

export type UpdateCommentDto = Partial<CreateCommentDto>;

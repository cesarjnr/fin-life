import { IsNumber, IsOptional, IsString, Matches } from 'class-validator';

export class CreateRevenueDto {
  @Matches(/^\d{2}-\d{2}-\d{4}$/, { message: 'date must be in MM-dd-yyyy format' })
  readonly date: string;

  @IsString()
  readonly description: string;

  @IsString()
  readonly destinyInstitution: string;

  @IsString()
  readonly source: string;

  @IsNumber()
  readonly value: number;
}

export class UpdateRevenueDto {
  @Matches(/^\d{2}-\d{2}-\d{4}$/, { message: 'date must be in MM-dd-yyyy format' })
  @IsOptional()
  readonly date: string;

  @IsString()
  @IsOptional()
  readonly description: string;

  @IsString()
  @IsOptional()
  readonly destinyInstitution: string;

  @IsString()
  @IsOptional()
  readonly source: string;

  @IsNumber()
  @IsOptional()
  readonly value: number;
} 

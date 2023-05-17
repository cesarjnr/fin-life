import { IsString } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  readonly description: string;
}

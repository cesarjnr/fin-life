import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { PayoutsService } from './payouts.service';
import { Payout } from './payout.entity';
import { CreatePayoutDto, GetPayoutsDto, PayoutsOverview, UpdatePayoutDto } from './payouts.dto';
import { GetRequestResponse } from '../common/dto/request';

@Controller('portfolios/:portfolioId')
export class PayoutsController {
  constructor(private payoutsService: PayoutsService) {}

  @Post('portfolios-assets/:portfolioAssetId/payouts')
  public async create(
    @Param('portfolioAssetId', ParseIntPipe) portfolioAssetId: number,
    @Body() createPayoutDto: CreatePayoutDto
  ): Promise<Payout> {
    return await this.payoutsService.create(portfolioAssetId, createPayoutDto);
  }

  @Post('portfolios-assets/:portfolioAssetId/payouts/import')
  @UseInterceptors(FileInterceptor('file'))
  public async import(
    @Param('portfolioAssetId', ParseIntPipe) portfolioAssetId: number,
    @UploadedFile() file: Express.Multer.File
  ): Promise<Payout[]> {
    return await this.payoutsService.import(portfolioAssetId, file);
  }

  @Get('payouts')
  public async get(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Query() getPayoutsDto: GetPayoutsDto
  ): Promise<GetRequestResponse<Payout>> {
    return await this.payoutsService.get(portfolioId, getPayoutsDto);
  }

  @Get('payouts/overview')
  public async getOverview(@Param('portfolioId', ParseIntPipe) portfolioId: number): Promise<PayoutsOverview> {
    return await this.payoutsService.getOverview(portfolioId);
  }

  @Patch('portfolios-assets/:portfolioAssetId/payouts/:payoutId')
  public async update(
    @Param('payoutId', ParseIntPipe) payoutId: number,
    @Body() updatePayoutDto: UpdatePayoutDto
  ): Promise<Payout> {
    return await this.payoutsService.update(payoutId, updatePayoutDto);
  }

  @Delete('portfolios-assets/:portfolioAssetId/ppayouts/:payoutId')
  public async delete(@Param('payoutId', ParseIntPipe) payoutId: number): Promise<void> {
    return await this.payoutsService.delete(payoutId);
  }
}

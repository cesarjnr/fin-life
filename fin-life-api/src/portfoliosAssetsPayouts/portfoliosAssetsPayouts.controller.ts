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

import { PortfoliosAssetsPayoutsService } from './portfoliosAssetsPayouts.service';
import { PortfolioAssetPayout } from './portfolioAssetPayout.entity';
import {
  CreatePortfolioAssetPayoutDto,
  GetPortfolioAssetPayoutsDto,
  PortfolioAssetsPayoutsOverview,
  UpdatePortfolioAssetPayoutDto
} from './portfoliosAssetsPayouts.dto';
import { GetRequestResponse } from '../common/dto/request';

@Controller('portfolios/:portfolioId')
export class PortfoliosAssetsPayoutsController {
  constructor(private portfoliosAssetsPayoutsService: PortfoliosAssetsPayoutsService) {}

  @Post('portfolios-assets/:portfolioAssetId/portfolios-assets-payouts')
  public async create(
    @Param('portfolioAssetId', ParseIntPipe) portfolioAssetId: number,
    @Body() createPortfolioAssetPayoutDto: CreatePortfolioAssetPayoutDto
  ): Promise<PortfolioAssetPayout> {
    return await this.portfoliosAssetsPayoutsService.create(portfolioAssetId, createPortfolioAssetPayoutDto);
  }

  @Post('portfolios-assets/:portfolioAssetId/portfolios-assets-payouts/import')
  @UseInterceptors(FileInterceptor('file'))
  public async import(
    @Param('portfolioAssetId', ParseIntPipe) portfolioAssetId: number,
    @UploadedFile() file: Express.Multer.File
  ): Promise<PortfolioAssetPayout[]> {
    return await this.portfoliosAssetsPayoutsService.import(portfolioAssetId, file);
  }

  @Get('portfolios-assets-payouts')
  public async get(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Query() getPortfolioAssetPayouts: GetPortfolioAssetPayoutsDto
  ): Promise<GetRequestResponse<PortfolioAssetPayout>> {
    return await this.portfoliosAssetsPayoutsService.get(portfolioId, getPortfolioAssetPayouts);
  }

  @Get('portfolios-assets-payouts/overview')
  public async getOverview(
    @Param('portfolioId', ParseIntPipe) portfolioId: number
  ): Promise<PortfolioAssetsPayoutsOverview> {
    return await this.portfoliosAssetsPayoutsService.getOverview(portfolioId);
  }

  @Patch('portfolios-assets/:portfolioAssetId/portfolios-assets-payouts/:portfolioAssetPayoutId')
  public async update(
    @Param('portfolioAssetPayoutId', ParseIntPipe) portfolioAssetPayoutId: number,
    @Body() updatePortfolioAssetPayoutDto: UpdatePortfolioAssetPayoutDto
  ): Promise<PortfolioAssetPayout> {
    return await this.portfoliosAssetsPayoutsService.update(portfolioAssetPayoutId, updatePortfolioAssetPayoutDto);
  }

  @Delete('portfolios-assets/:portfolioAssetId/portfolios-assets-payouts/:portfolioAssetPayoutId')
  public async delete(@Param('portfolioAssetPayoutId', ParseIntPipe) portfolioAssetPayoutId: number): Promise<void> {
    return await this.portfoliosAssetsPayoutsService.delete(portfolioAssetPayoutId);
  }
}

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

import { PortfoliosAssetsDividendsService } from './portfoliosAssetsDividends.service';
import { PortfolioAssetDividend } from './portfolioAssetDividend.entity';
import {
  CreatePortfolioAssetDividendDto,
  GetPortfolioAssetDividendsDto,
  PortfolioAssetsDividendsOverview,
  UpdatePortfolioAssetDividendDto
} from './portfoliosAssetsDividends.dto';
import { GetRequestResponse } from '../common/dto/request';

@Controller('portfolios/:portfolioId')
export class PortfoliosAssetsDividendsController {
  constructor(private portfoliosAssetsDividendsService: PortfoliosAssetsDividendsService) {}

  @Post('portfolios-assets/:portfolioAssetId/portfolios-assets-dividends')
  public async create(
    @Param('portfolioAssetId', ParseIntPipe) portfolioAssetId: number,
    @Body() createPortfolioAssetDividendDto: CreatePortfolioAssetDividendDto
  ): Promise<PortfolioAssetDividend> {
    return await this.portfoliosAssetsDividendsService.create(portfolioAssetId, createPortfolioAssetDividendDto);
  }

  @Post('portfolios-assets/:portfolioAssetId/portfolios-assets-dividends/import')
  @UseInterceptors(FileInterceptor('file'))
  public async import(
    @Param('portfolioAssetId', ParseIntPipe) portfolioAssetId: number,
    @UploadedFile() file: Express.Multer.File
  ): Promise<PortfolioAssetDividend[]> {
    return await this.portfoliosAssetsDividendsService.import(portfolioAssetId, file);
  }

  @Get('portfolios-assets-dividends')
  public async get(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Query() getPortfolioAssetDividends: GetPortfolioAssetDividendsDto
  ): Promise<GetRequestResponse<PortfolioAssetDividend>> {
    return await this.portfoliosAssetsDividendsService.get(portfolioId, getPortfolioAssetDividends);
  }

  @Get('portfolios-assets-dividends/overview')
  public async getOverview(
    @Param('portfolioId', ParseIntPipe) portfolioId: number
  ): Promise<PortfolioAssetsDividendsOverview> {
    return await this.portfoliosAssetsDividendsService.getOverview(portfolioId);
  }

  @Patch('portfolios-assets/:portfolioAssetId/portfolios-assets-dividends/:portfolioAssetDividendId')
  public async update(
    @Param('portfolioAssetDividendId', ParseIntPipe) portfolioAssetDividendId: number,
    @Body() updatePortfolioAssetDividendDto: UpdatePortfolioAssetDividendDto
  ): Promise<PortfolioAssetDividend> {
    return await this.portfoliosAssetsDividendsService.update(
      portfolioAssetDividendId,
      updatePortfolioAssetDividendDto
    );
  }

  @Delete('portfolios-assets/:portfolioAssetId/portfolios-assets-dividends/:portfolioAssetDividendId')
  public async delete(
    @Param('portfolioAssetDividendId', ParseIntPipe) portfolioAssetDividendId: number
  ): Promise<void> {
    return await this.portfoliosAssetsDividendsService.delete(portfolioAssetDividendId);
  }
}

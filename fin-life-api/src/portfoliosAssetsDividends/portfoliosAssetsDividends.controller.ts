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

import { GetPortfolioAssetDividendsDto, PortfoliosAssetsDividendsService } from './portfoliosAssetsDividends.service';
import { PortfolioAssetDividend } from './portfolioAssetDividend.entity';
import { CreatePortfolioAssetDividendDto, UpdatePortfolioAssetDividendDto } from './portfoliosAssetsDividends.dto';
import { PaginationResponse } from '../common/dto/pagination';

@Controller('users/:userId/portfolios/:portfolioId/portfolios-assets/:portfolioAssetId/portfolios-assets-dividends')
export class PortfoliosAssetsDividendsController {
  constructor(private portfoliosAssetsDividendsService: PortfoliosAssetsDividendsService) {}

  @Post()
  public async create(
    @Param('portfolioAssetId', ParseIntPipe) portfolioAssetId: number,
    @Body() createPortfolioAssetDividendDto: CreatePortfolioAssetDividendDto
  ): Promise<PortfolioAssetDividend> {
    return await this.portfoliosAssetsDividendsService.create(portfolioAssetId, createPortfolioAssetDividendDto);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  public async import(
    @Param('portfolioAssetId', ParseIntPipe) portfolioAssetId: number,
    @UploadedFile() file: Express.Multer.File
  ): Promise<PortfolioAssetDividend[]> {
    return await this.portfoliosAssetsDividendsService.import(portfolioAssetId, file);
  }

  @Get()
  public async get(
    @Param('portfolioAssetId', ParseIntPipe) portfolioAssetId: number,
    @Query() getPortfolioAssetDividends: GetPortfolioAssetDividendsDto
  ): Promise<PaginationResponse<PortfolioAssetDividend>> {
    return await this.portfoliosAssetsDividendsService.get({ ...getPortfolioAssetDividends, portfolioAssetId });
  }

  @Patch(':portfolioAssetDividendId')
  public async update(
    @Param('portfolioAssetDividendId', ParseIntPipe) portfolioAssetDividendId: number,
    @Body() updatePortfolioAssetDividendDto: UpdatePortfolioAssetDividendDto
  ): Promise<PortfolioAssetDividend> {
    return await this.portfoliosAssetsDividendsService.update(
      portfolioAssetDividendId,
      updatePortfolioAssetDividendDto
    );
  }

  @Delete(':portfolioAssetDividendId')
  public async delete(
    @Param('portfolioAssetDividendId', ParseIntPipe) portfolioAssetDividendId: number
  ): Promise<void> {
    return await this.portfoliosAssetsDividendsService.delete(portfolioAssetDividendId);
  }
}

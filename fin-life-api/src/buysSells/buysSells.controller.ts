import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { BuysSellsService, GetBuysSellsDto } from './buysSells.service';
import { BuySell } from './buySell.entity';
import { CreateBuySellDto, ImportBuysSellsDto } from './buysSells.dto';
import { PaginationResponse } from '../common/dto/pagination';

@Controller('users/:userId/portfolios/:portfolioId/buys-sells')
export class BuysSellsController {
  constructor(private buysSellsService: BuysSellsService) {}

  @Post()
  public async create(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Body() createBuySellDto: CreateBuySellDto
  ): Promise<BuySell> {
    return await this.buysSellsService.create(portfolioId, createBuySellDto);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  public async import(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() importBuysSellsDto: ImportBuysSellsDto
  ): Promise<BuySell[]> {
    return await this.buysSellsService.import(portfolioId, file, importBuysSellsDto);
  }

  @Get()
  public async get(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Query() getBuysSellsDto: GetBuysSellsDto
  ): Promise<PaginationResponse<BuySell>> {
    return await this.buysSellsService.get({ ...getBuysSellsDto, portfolioId });
  }
}

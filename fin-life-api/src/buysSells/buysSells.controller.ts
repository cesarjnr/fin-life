import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { BuysSellsService } from './buysSells.service';
import { BuySell } from './buySell.entity';
import { CreateBuySellDto, GetBuysSellsDto, ImportBuysSellsDto } from './buysSells.dto';
import { GetRequestResponse } from '../common/dto/request';

@Controller('portfolios/:portfolioId/buys-sells')
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
  ): Promise<GetRequestResponse<BuySell>> {
    return await this.buysSellsService.get({ ...getBuysSellsDto, portfolioId });
  }

  @Delete(':id')
  @HttpCode(204)
  public async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.buysSellsService.delete(id);
  }
}

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';

import { MarketIndex } from './marketIndex.entity';
import { GetRequestResponse } from '../common/dto/request';
import { MarketIndexesService } from './marketIndexes.service';
import {
  CreateMarketIndexDto,
  FindMarketIndexDto,
  GetMarketIndexesDto,
  SyncMarketIndexDataDto
} from './marketIndexes.dto';

@Controller('market-indexes')
export class MarketIndexesController {
  constructor(private readonly marketIndexesService: MarketIndexesService) {}

  @Post()
  public async create(@Body() createMarketIndexDto: CreateMarketIndexDto): Promise<MarketIndex> {
    return await this.marketIndexesService.create(createMarketIndexDto);
  }

  @Post('market-index-historical-data/sync')
  public async syncMarketIndexData(@Body() syncMarketIndexDataDto?: SyncMarketIndexDataDto): Promise<MarketIndex[]> {
    return await this.marketIndexesService.syncData(syncMarketIndexDataDto);
  }

  @Get()
  public async get(@Query() getMarketIndexesDto: GetMarketIndexesDto): Promise<GetRequestResponse<MarketIndex>> {
    return await this.marketIndexesService.get(getMarketIndexesDto);
  }

  @Get(':id')
  public async find(
    @Param('id', ParseIntPipe) id: number,
    @Query() findMarketIndexDto: Omit<FindMarketIndexDto, 'id'>
  ): Promise<MarketIndex> {
    return await this.marketIndexesService.find({ id, ...findMarketIndexDto });
  }

  @Delete(':id')
  public async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.marketIndexesService.delete(id);
  }
}

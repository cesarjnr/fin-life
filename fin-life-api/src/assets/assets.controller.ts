import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';

import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto, GetAssetsDto, FindAssetDto, SyncPricesDto } from './assets.dto';
import { Asset } from './asset.entity';
import { GetRequestResponse } from '../common/dto/request';

@Controller('assets')
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Post()
  public async create(@Body() createAssetDto: CreateAssetDto): Promise<Asset> {
    return await this.assetsService.create(createAssetDto);
  }

  @Get()
  public async get(@Query() getAssetsDto: GetAssetsDto): Promise<GetRequestResponse<Asset>> {
    return await this.assetsService.get(getAssetsDto);
  }

  @Get(':assetId')
  public async find(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Query() findAssetDto: FindAssetDto
  ): Promise<Asset> {
    return await this.assetsService.find(assetId, findAssetDto);
  }

  @Patch('sync-prices')
  public async syncPrices(@Query() syncPricesDto?: SyncPricesDto): Promise<Asset[]> {
    return await this.assetsService.syncPrices(syncPricesDto?.assetId);
  }

  @Patch(':assetId')
  public async update(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Body() updateAssetDto: UpdateAssetDto
  ): Promise<Asset> {
    return await this.assetsService.update(assetId, updateAssetDto);
  }

  @Delete(':assetId')
  public async delete(@Param('assetId', ParseIntPipe) assetId: number): Promise<void> {
    return await this.assetsService.delete(assetId);
  }
}

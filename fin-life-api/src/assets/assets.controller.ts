import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { AssetsService, GetAssetsDto, FindAssetParams } from './assets.service';
import { CreateAssetDto, UpdateAssetDto } from './assets.dto';
import { Asset } from './asset.entity';

@Controller('assets')
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Post()
  public async create(@Body() createAssetDto: CreateAssetDto): Promise<Asset> {
    return await this.assetsService.create(createAssetDto);
  }

  @Get()
  public async get(@Query() getAssetsDto: GetAssetsDto): Promise<Asset[]> {
    return await this.assetsService.get(getAssetsDto);
  }

  @Get(':assetId')
  public async find(@Param('assetId', ParseIntPipe) assetId: number, @Query() params: FindAssetParams): Promise<Asset> {
    return await this.assetsService.find(assetId, params);
  }

  @Patch(':assetId')
  public async update(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Body() updateAssetDto: UpdateAssetDto
  ): Promise<Asset> {
    return await this.assetsService.update(assetId, updateAssetDto);
  }

  @Patch(':assetId/sync-prices')
  public async syncPrices(@Param('assetId', ParseIntPipe) assetId: number): Promise<Asset> {
    return await this.assetsService.syncPrices(assetId);
  }
}

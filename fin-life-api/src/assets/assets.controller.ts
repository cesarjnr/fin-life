import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';

import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto, GetAssetsDto, FindAssetDto } from './assets.dto';
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

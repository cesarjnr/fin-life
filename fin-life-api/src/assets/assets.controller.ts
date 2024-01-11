import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';

import { AssetsService, GetAssetsParams, FindAssetParams } from './assets.service';
import { CreateAssetDto } from './assets.dto';
import { Asset } from './asset.entity';

@Controller('assets')
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Post()
  public async create(@Body() createAssetDto: CreateAssetDto): Promise<Asset> {
    return await this.assetsService.create(createAssetDto);
  }

  @Get()
  public async get(@Query() params: GetAssetsParams): Promise<Asset[]> {
    return await this.assetsService.get(params);
  }

  @Get(':assetId')
  public async find(@Param('assetId', ParseIntPipe) assetId: number, @Query() params: FindAssetParams): Promise<Asset> {
    return await this.assetsService.find(assetId, params);
  }
}

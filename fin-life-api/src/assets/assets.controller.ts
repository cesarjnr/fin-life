import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';

import { AssetsService } from './assets.service';
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
  public async get(): Promise<Asset[]> {
    return await this.assetsService.get();
  }

  @Get(':assetId')
  public async find(@Param('assetId', ParseIntPipe) assetId: number): Promise<Asset> {
    return await this.assetsService.find(assetId);
  }
}

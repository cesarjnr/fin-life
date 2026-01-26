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

import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto, GetAssetsDto, FindAssetDto, SyncPricesDto } from './assets.dto';
import { Asset } from './asset.entity';
import { GetRequestResponse } from '../common/dto/request';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('assets')
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Post()
  public async create(@Body() createAssetDto: CreateAssetDto): Promise<Asset> {
    return await this.assetsService.create(createAssetDto);
  }

  @Post(':id/asset-historical-prices/import')
  @UseInterceptors(FileInterceptor('file'))
  public async import(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File
  ): Promise<Asset> {
    return await this.assetsService.importPrices(id, file);
  }

  @Post('asset-historical-prices/sync')
  public async syncAssetsPrices(@Body() syncPricesDto?: SyncPricesDto): Promise<Asset[]> {
    return await this.assetsService.syncPrices(syncPricesDto?.assetId);
  }

  @Post(':id/split-historical-events/sync')
  public async syncAssetSplits(@Param('id', ParseIntPipe) id: number): Promise<Asset> {
    return await this.assetsService.syncSplits(id);
  }

  @Get()
  public async get(@Query() getAssetsDto: GetAssetsDto): Promise<GetRequestResponse<Asset>> {
    return await this.assetsService.get(getAssetsDto);
  }

  @Get(':id')
  public async find(@Param('id', ParseIntPipe) id: number, @Query() findAssetDto: FindAssetDto): Promise<Asset> {
    return await this.assetsService.find(id, findAssetDto);
  }

  @Patch(':id')
  public async update(@Param('id', ParseIntPipe) id: number, @Body() updateAssetDto: UpdateAssetDto): Promise<Asset> {
    return await this.assetsService.update(id, updateAssetDto);
  }

  @Delete(':id')
  public async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.assetsService.delete(id);
  }
}

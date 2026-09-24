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

import { PortfoliosAssetsEventsService } from './portfoliosAssetsEvents.service';
import { PortfolioAssetEvent } from './portfolioAssetEvent.entity';
import {
  CreatePortfolioAssetEventDto,
  GetPortfolioAssetEventsDto,
  PortfolioAssetPayoutsOverview,
  UpdatePortfolioAssetEventDto
} from './portfoliosAssetsEvents.dto';
import { GetRequestResponse } from '../common/dto/request';

@Controller('portfolios/:portfolioId')
export class PortfoliosAssetsEventsController {
  constructor(private portfoliosAssetsEventsService: PortfoliosAssetsEventsService) {}

  @Post('portfolios-assets/:portfolioAssetId/events')
  public async create(
    @Param('portfolioAssetId', ParseIntPipe) portfolioAssetId: number,
    @Body() createPortfolioAssetEventDto: CreatePortfolioAssetEventDto
  ): Promise<PortfolioAssetEvent> {
    return await this.portfoliosAssetsEventsService.create(portfolioAssetId, createPortfolioAssetEventDto);
  }

  @Post('portfolios-assets/:portfolioAssetId/events/import')
  @UseInterceptors(FileInterceptor('file'))
  public async import(
    @Param('portfolioAssetId', ParseIntPipe) portfolioAssetId: number,
    @UploadedFile() file: Express.Multer.File
  ): Promise<PortfolioAssetEvent[]> {
    return await this.portfoliosAssetsEventsService.import(portfolioAssetId, file);
  }

  @Get('events')
  public async get(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Query() getPortfolioAssetEventsDto: GetPortfolioAssetEventsDto
  ): Promise<GetRequestResponse<PortfolioAssetEvent>> {
    return await this.portfoliosAssetsEventsService.get(portfolioId, getPortfolioAssetEventsDto);
  }

  @Get('events/payouts-overview')
  public async getPayoutsOverview(
    @Param('portfolioId', ParseIntPipe) portfolioId: number
  ): Promise<PortfolioAssetPayoutsOverview> {
    return await this.portfoliosAssetsEventsService.getPayoutsOverview(portfolioId);
  }

  // @Patch('portfolios-assets/:portfolioAssetId/events/:eventId')
  // public async update(
  //   @Param('eventId', ParseIntPipe) eventId: number,
  //   @Body() updatePortfolioAssetEventDto: UpdatePortfolioAssetEventDto
  // ): Promise<PortfolioAssetEvent> {
  //   return await this.portfoliosAssetsEventsService.update(eventId, updatePortfolioAssetEventDto);
  // }

  // @Delete('portfolios-assets/:portfolioAssetId/events/:eventId')
  // public async delete(@Param('eventId', ParseIntPipe) eventId: number): Promise<void> {
  //   return await this.portfoliosAssetsEventsService.delete(eventId);
  // }
}

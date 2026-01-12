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

import { OperationsService } from './operations.service';
import { Operation } from './operation.entity';
import { CreateOperationDto, GetOperationsDto, ImportOperationsDto } from './operation.dto';
import { GetRequestResponse } from '../common/dto/request';

@Controller('portfolios/:portfolioId/operations')
export class OperationsController {
  constructor(private operationsService: OperationsService) {}

  @Post()
  public async create(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @Body() createOperationDto: CreateOperationDto
  ): Promise<Operation> {
    return await this.operationsService.create(portfolioId, createOperationDto);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  public async import(
    @Param('portfolioId', ParseIntPipe) portfolioId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() importOperationsDto: ImportOperationsDto
  ): Promise<Operation[]> {
    return await this.operationsService.import(portfolioId, file, importOperationsDto);
  }

  @Get()
  public async get(@Query() getOperationsDto: GetOperationsDto): Promise<GetRequestResponse<Operation>> {
    return await this.operationsService.get(getOperationsDto);
  }

  @Delete(':id')
  @HttpCode(204)
  public async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.operationsService.delete(id);
  }
}

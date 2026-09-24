import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { PortfoliosAssetsService } from './portfoliosAssets.service';
import { Request } from '../common/dto/request';

@Injectable()
export class PortfolioAssetOwnershipGuard implements CanActivate {
  constructor(private readonly portfoliosAssetsService: PortfoliosAssetsService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const portfolioAssetId = Number(request.params.portfolioAssetId);

    await this.portfoliosAssetsService.verifyOwnership(portfolioAssetId, request.user.sub);

    return true;
  }
}

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { PortfoliosService } from './portfolios.service';
import { Request } from '../common/dto/request';

@Injectable()
export class PortfolioOwnershipGuard implements CanActivate {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const portfolioId = Number(request.params.portfolioId);

    await this.portfoliosService.verifyOwnership(portfolioId, request.user.sub);

    return true;
  }
}

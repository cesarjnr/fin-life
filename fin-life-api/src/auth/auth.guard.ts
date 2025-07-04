import { CanActivate, ExecutionContext, Injectable, Logger, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';

export const IS_PUBLIC_ROUTE_KEY = 'isPublicRoute';
export const Public = () => SetMetadata(IS_PUBLIC_ROUTE_KEY, true);

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isRoutePublic = this.reflector.getAllAndOverride(IS_PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isRoutePublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      const errorMessage = 'Token missing';

      this.logger.error(errorMessage);

      throw new UnauthorizedException(errorMessage);
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET')
      });

      request['user'] = payload;
    } catch (error) {
      let errorMessage = '';

      if (error instanceof TokenExpiredError) {
        errorMessage = 'Token expired';
      } else if (error instanceof JsonWebTokenError) {
        errorMessage = 'Invalid token';
      }

      this.logger.error(error.message);

      throw new UnauthorizedException(errorMessage);
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [, authToken] = request.headers.authorization?.split(' ') ?? [];
    const [, cookieToken] = request.headers.cookie?.match(/access_token=([^;]+)/) ?? [];

    return authToken || cookieToken;
  }
}

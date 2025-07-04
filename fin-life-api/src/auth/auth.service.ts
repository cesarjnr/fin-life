import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../users/users.service';
import { PasswordHelper } from '../common/helpers/password.helper';
import { LoginDto } from './auth.dto';
import { User } from '../users/user.entity';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private passwordHelper: PasswordHelper
  ) {}

  public async login(loginDto: LoginDto): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const user = await this.usersService.find({ email: loginDto.email, relations: ['portfolios'] });
      const isPasswordValid = await this.passwordHelper.compareHash(loginDto.password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const tokens = await this.generateTokens(user);

      return { user, tokens };
    } catch (error) {
      this.logger.error(error.message);

      throw new UnauthorizedException('Invalid credentials');
    }
  }

  public async refresh(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new BadRequestException('refresh_token is required');
    }

    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.get<string>('JWT_SECRET_REFRESH')
    });
    const user = await this.usersService.find({ id: payload.sub });

    return await this.generateTokens(user);
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = {
      sub: user.id,
      username: user.email
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      refreshToken: await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET_REFRESH'),
        expiresIn: '7d'
      })
    };
  }
}

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../users/users.service';
import { PasswordHelper } from '../common/helpers/password.helper';
import { LoginDto, LoginResponse, RefreshTokenDto } from './auth.dto';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private passwordHelper: PasswordHelper
  ) {}

  public async login(loginDto: LoginDto): Promise<LoginResponse> {
    try {
      const user = await this.usersService.find({ email: loginDto.email });
      const isPasswordValid = await this.passwordHelper.compareHash(loginDto.password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return await this.generateTokens(user);
    } catch (error) {
      this.logger.error(error.message);

      throw new UnauthorizedException('Invalid credentials');
    }
  }

  public async refresh(refreshTokenDto: RefreshTokenDto): Promise<LoginResponse> {
    const payload = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken, {
      secret: this.configService.get<string>('JWT_SECRET_REFRESH')
    });
    const user = await this.usersService.find({ id: payload.sub });

    return await this.generateTokens(user);
  }

  private async generateTokens(user: User): Promise<LoginResponse> {
    const payload = {
      sub: user.id,
      username: user.email
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET_REFRESH'),
        expiresIn: '7d'
      })
    };
  }
}

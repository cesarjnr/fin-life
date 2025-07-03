import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { LoginDto, LoginResponse, RefreshTokenDto } from './auth.dto';
import { Public } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  public async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return await this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  public async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<LoginResponse> {
    return await this.authService.refresh(refreshTokenDto);
  }

  @Post('logout')
  @HttpCode(204)
  public logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie('refreshToken');
  }
}

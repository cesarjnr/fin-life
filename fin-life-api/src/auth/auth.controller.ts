import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService, AuthTokens } from './auth.service';
import { LoginDto } from './auth.dto';
import { Public } from './auth.guard';
import { User } from '../users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  public async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response): Promise<User> {
    const { user, tokens } = await this.authService.login(loginDto);

    this.setCookieTokens(res, tokens);

    return user;
  }

  @Public()
  @Post('refresh')
  @HttpCode(204)
  public async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const [, refreshToken] = req.headers.cookie?.match(/refresh_token=([^;]+)/) ?? [];
    const tokens = await this.authService.refresh(refreshToken);

    this.setCookieTokens(res, tokens);
  }

  @Public()
  @Post('logout')
  @HttpCode(204)
  public logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }

  private setCookieTokens(res: Response, tokens: AuthTokens): void {
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'dev' ? false : true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'dev' ? false : true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });
  }
}

import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { AuthDTO } from './dto';
import { GoogleGuard, Guard42, JwtGuard } from './guards';
import { getUser } from './decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /***** EMAIL *****/
  @Post('signup')
  async signup(
    @Body() dto: AuthDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.signup(dto);

    const user = await this.login(dto, response);

    return user;
  }

  @Post('login')
  async login(
    @Body() dto: AuthDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.login(dto);
    const access_token = user.access_token;
    const refresh_token = user.refresh_token;
    delete user.access_token;
    delete user.refresh_token;
    delete user.user.password;
    delete user.user.tfa_secret;

    // Set cookie
    response.cookie('access_token', access_token, {
      maxAge: 2592000000,
      sameSite: true,
      secure: false,
    });

    response.cookie('refresh_token', refresh_token, {
      maxAge: 2592000000,
      sameSite: true,
      secure: false,
    });
    // Return user to frontend
    return user.user;
  }

  /***** 42 LOGIN *****/
  @UseGuards(Guard42)
  @Get('forty-two')
  async login42() {}

  @UseGuards(Guard42)
  @Get('callback')
  async authCallback(
    @getUser() user: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const logged_user = await this.authService.login42(user);
    response.cookie('access_token', logged_user.accessToken, {
      maxAge: 2592000000,
      sameSite: true,
      secure: false,
    });

    response.cookie('refresh_token', logged_user.refresh_token, {
      maxAge: 2592000000,
      sameSite: true,
      secure: false,
    });

    if (logged_user.tfa_enabled) {
      response.cookie('email', logged_user.email, {
        maxAge: 2592000000,
        sameSite: true,
        secure: false,
      });
      response.redirect('http://localhost:3001/2fa');
    } else {
      let url = `http://localhost:3001/users/${logged_user.username}`;
      if (logged_user.firstLogin) {
        url = `http://localhost:3001/firstLogin`;
      }
      response.redirect(url);
    }
  }

  /***** LOGOUT *****/
  @Get('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const accessToken = req.cookies['access_token'];
    response.cookie('access_token', '');
    return this.authService.logout(accessToken);
  }

  /***** REFRESH *****/
  @Get('refresh-token')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const newTokens = await this.authService.refresh(
      req.cookies['refresh_token'],
      req.cookies['access_token'],
    );
    response.cookie('access_token', newTokens.newAccessToken, {
      maxAge: 2592000000,
      sameSite: true,
      secure: false,
    });
    response.cookie('refresh_token', newTokens.newRefreshToken, {
      maxAge: 2592000000,
      sameSite: true,
      secure: false,
    });

    return newTokens.user;
  }

  /***** TWO FACTOR AUTHENTICATION *****/

  @Post('2fa/turn-on')
  @UseGuards(JwtGuard)
  async turnOnTFA(@Req() request: Request, @Body() body: any) {
    const user = await this.authService.getUserFromToken(
      request.cookies['access_token'],
    );

    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.tfa_code,
      user,
    );
    if (!isCodeValid) throw new ForbiddenException('Wrong authentication code');

    const newUser = await this.authService.turnOnTwoFactorAuthentication(user);
    return newUser;
  }

  @Post('2fa/turn-off')
  @UseGuards(JwtGuard)
  async turnOffTFA(@Req() request: Request, @Body() body: any) {
    const user = await this.authService.getUserFromToken(
      request.cookies['access_token'],
    );

    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.tfa_code,
      user,
    );
    if (!isCodeValid) throw new ForbiddenException('Wrong authentication code');

    const newUser = await this.authService.turnOffTwoFactorAuthentication(user);
    return newUser;
  }

  @Post('2fa/authenticate')
  async authenticate(
    @Body() body: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.getUserFromEmail(body.email);

    if (!user) throw new ForbiddenException('Invalid email provided');

    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.tfa_code,
      user,
    );

    if (!isCodeValid) {
      throw new ForbiddenException('Wrong authentication code');
    }

    const result = await this.authService.login2fa(user);
    response.cookie('access_token', result.access_token, {
      maxAge: 2592000000,
      sameSite: true,
      secure: false,
    });
    response.cookie('refresh_token', result.refresh_token, {
      maxAge: 2592000000,
      sameSite: true,
      secure: false,
    });

    return result.updatedUser;
  }

  @Get('2fa/generate')
  async generateCode(@Req() request: Request) {
    const user = await this.authService.getUserFromToken(
      request.cookies['access_token'],
    );

    const otpAuthUrl =
      await this.authService.generateTwoFactorAuthenticationSecret(user);
    const code = this.authService.generateQrCodeDataURL(otpAuthUrl);

    return code;
  }
}

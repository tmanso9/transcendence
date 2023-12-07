import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Response, Request } from "express";

import { AuthService } from "./auth.service";
import { AuthDTO } from "./dto";
import { GoogleGuard, Guard42 } from "./guards";
import { getUser } from "./decorator";
import { request } from "http";

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	/***** EMAIL *****/
	@Post('signup')
	async signup(@Body() dto: AuthDTO, @Res({passthrough: true}) response: Response) {
		await this.authService.signup(dto);

		const user = await this.login(dto, response)
		response.cookie('access_token', user.access_token, {
			maxAge: 2592000000,
			sameSite: true,
			secure: false,
		});
		
		return user
	}

	@Post('login')
	async login(@Body() dto: AuthDTO, @Res({passthrough: true}) response: Response) {
		const user = await this.authService.login(dto);
		const access_token = user.access_token;
		// delete user.access_token;

		// Set cookie
		response.cookie('access_token', user.access_token, {
			maxAge: 2592000000,
			sameSite: true,
			secure: false,
		});

		// Return user to frontend
		return user;
	}

	/***** GOOGLE LOGIN *****/
	@UseGuards(GoogleGuard)
	@Get('google')
	async auth() {}

	@UseGuards(GoogleGuard)
	@Get('google/redirect')
	async googleLogin(@getUser() user: any, @Res({passthrough: true}) response: Response) {
		const logged_user = await this.authService.googleLogin(user);
		const access_token = logged_user.access_token;
		delete logged_user.access_token;

		// Set cookie
		response.cookie("access_token", access_token, {
			maxAge: 2592000000,
			sameSite: true,
			secure: false,
		});

		const url = `http://localhost:3001/users/${logged_user.username}`;
		
		response.redirect(url)
	}

	/***** 42 LOGIN *****/
	@UseGuards(Guard42)
    @Get('forty-two')
    async login42(){}

    @UseGuards(Guard42)
    @Get('callback')
    async authCallback(@getUser() user: any, @Res({ passthrough: true }) response: Response) {
        const logged_user = await this.authService.login42(user);
        response.cookie('access_token', logged_user.accessToken);
		
		const url = `http://localhost:3001/users/${logged_user.username}`;

		response.redirect(url)
    }

	/***** LOGOUT *****/
	@Get('logout')
	async logout(@Req() req: Request, @Res({ passthrough: true }) response: Response){
		const accessToken = req.cookies['access_token'];
		response.cookie('access_token', '');
		return this.authService.logout(accessToken)
	}
}
import { Body, Controller, Get, Post, Req, Res, UseGuards, Session } from "@nestjs/common";
import { Response } from "express";

import { AuthService } from "./auth.service";
import { AuthDTO } from "./dto";
import { GoogleGuard } from "./guards";
import { getUser } from "./decorator";
import { request } from "http";

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	/***** EMAIL *****/
	@Post('signup')
	signup(@Body() dto: AuthDTO) {
		return this.authService.signup(dto);
	}

	@Post('login')
	async login(@Body() dto: AuthDTO, @Res({passthrough: true}) response: Response) {
		const user = await this.authService.login(dto);
		const access_token = user.access_token;
		delete user.access_token;

		// Set cookie
		response.cookie("access_token", access_token);

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
}
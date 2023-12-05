import { Controller, Get, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '../auth/guards';
import { getUser } from '../auth/decorator';
import { getJWT } from './decorator';

@Controller('users')
export class UserController {
	constructor(private userService: UserService) {}

	@Get()
	async getUsers() {
		return this.userService.getUsers();
	}

	@UseGuards(JwtGuard)
	@Get('me')
	getMe(@getUser() user: any) {
		return this.userService.getMe(user);
	}

	// Send Friend Request
	@UseGuards(JwtGuard)
	@Post('friend-request/:id')
	async requestFriend(@Param() params: any, @getJWT() jwt: string) {
		const user_id = params.id;

		await this.userService.requestFriend(user_id, jwt);
		return HttpCode(200);
	}

	// Respond to Friend Request
	@UseGuards(JwtGuard)
	@Post('friend-response/:id/:action')
	async respondFriend(@Param() params: any, @getJWT() jwt: string) {
		const user_id = params.id;
		const action = params.action;

		await this.userService.respondFriend(user_id, action, jwt);
		return HttpCode(200);
	}
}

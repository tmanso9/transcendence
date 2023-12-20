import { Controller, Get, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '../auth/guards';
import { getUser } from '../auth/decorator';
import { decodeJwt } from './decorator';

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

	@UseGuards(JwtGuard)
	@Get(':username')
	getUserById(@Param('username') username: string) {
		return this.userService.getUserById(username);
	}

	// Send Friend Request
	@UseGuards(JwtGuard)
	@Post('friend-request/:id')
	async requestFriend(@Param('id') user_id: any, @decodeJwt() decoded_jwt: any) {
		await this.userService.requestFriend(user_id, decoded_jwt);
		return HttpCode(201);
	}

	// Respond to Friend Request
	@UseGuards(JwtGuard)
	@Post('friend-response/:id/:action')
	async respondFriend(@Param() params: any, @decodeJwt() decoded_jwt: any) {
		const user_id = params.id;
		const action = params.action;

		await this.userService.respondFriend(user_id, action, decoded_jwt);
		return HttpCode(201);
	}

	// Remove Friends
	@UseGuards(JwtGuard)
	@Post('remove-friend/:id')
	async removeFriend(@Param('id') user_id: any, @decodeJwt() decoded_jwt: any) {
		await this.userService.removeFriend(user_id, decoded_jwt);
		return HttpCode(201);
	}
}

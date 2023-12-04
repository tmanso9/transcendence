import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '../auth/guards';
import { getUser } from '../auth/decorator';

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
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
	getMe(user: any) {
		return user;
	}
}

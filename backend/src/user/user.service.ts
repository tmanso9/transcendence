import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async getUsers() {
		const all_users = await this.prisma.user.findMany({
			select: {
				username: true,
				wins: true,
				losses: true,
				points: true
			}
		});

		return all_users;
	}
	getMe(user: any) {
		return user;
	}
}

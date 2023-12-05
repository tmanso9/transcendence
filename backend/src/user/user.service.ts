import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { send } from 'process';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
		private config: ConfigService
	) {}

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

	async requestFriend(id: string, jwt: string) {
		// Save friend
		const friend = await this.prisma.user.findUnique({
			where: { id },
			include: { friends: true, friendOf: true },
		});

		// Check if the friend exists. If it doesn't, throw.
		if (!friend)
			throw new ForbiddenException('User does not exist');

		// Decode JWT to check that sender != receiver. If same, throw.
		const sender_info = await this.decodeJwtToken(jwt);
		if (id == sender_info.sub)
			throw new ForbiddenException('Sender is same as Receiver')
		
		// Check that sender and receiver are not already friends. If they are, throw.
		const sender = await this.prisma.user.findUnique({
			where: { id: sender_info.sub },
			include: { friends: true, friendOf: true },
		});
		if (!sender)
			throw new ForbiddenException('Something went wrong');
		if (friend.friends.includes(friend))
			throw new ForbiddenException('Already Friends');

		// Check if the request was already sent (bilateral check)
		const already_sent = await this.prisma.connections.findFirst({
			where: {
				OR: [
					{ creator: sender_info.sub, receiver: id },
					{ creator: id, receiver: sender_info.sub }
				]
			}
		});

		if (already_sent)
			throw new ForbiddenException('Friend Request already sent');

		// Add new connection to database
		const connection = await this.prisma.connections.create({
			data: {
				creator: sender_info.sub,
				receiver: id
			}
		});
	}

	async respondFriend(id: string, action: string, jwt: string) {
		// Check if action is either 'accept' or 'reject'. If not, throw
		if (action != 'accept' && action != 'reject')
			throw new ForbiddenException(`Invalid Action: ${action}`);

		// Save target friend
		let friend = await this.prisma.user.findUnique({
			where: { id }
		});

		// Check if the friend exists. If it doesn't, throw.
		if (!friend)
			throw new ForbiddenException('User does not exist');

		// Decode JWT to check that sender != receiver. If same, throw.
		const sender_info = await this.decodeJwtToken(jwt);
		if (id == sender_info.sub)
			throw new ForbiddenException('Sender is same as Receiver')
		
		// Check that sender and receiver are not already friends. If they are, throw.
		let sender = await this.prisma.user.findUnique({
			where: { id: sender_info.sub },
			include: { friends: true, friendOf: true },
		});

		if (!sender)
			throw new ForbiddenException('Something went wrong');
		
		if (sender.friends.map(user => user.id).includes(id))
			throw new ForbiddenException('Already Friends');

		// Check if request exists. If not, throw.
		const req_exists = await this.prisma.connections.findFirst({
			where: {
				creator: id,
				receiver: sender_info.sub
			}
		});

		if (!req_exists)
			throw new ForbiddenException('Friend Request does not exist');
		
		if (action == 'accept') {
			// Add friendship to all.
			await this.prisma.user.update({
				where: { id: sender_info.sub },
				data: { friends: { connect: [{ id: id }]}}
			});

			await this.prisma.user.update({
				where: { id: id },
				data: { friends: { connect: [{ id: sender_info.sub }]}}
			});
		}

		// Remove connection from DB.
		await this.prisma.connections.deleteMany({
			where: {
				creator: id,
				receiver: sender_info.sub
			}
		});
	}

	// Decodes JWT and returns 
	private decodeJwtToken(token: string): Promise<{ sub: string, email: string }> {
		return this.jwt.decode(token);
	}
}

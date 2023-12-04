import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDTO } from "./dto";
import * as argon from 'argon2';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from "rxjs";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private httpService: HttpService,
		private jwt: JwtService,
		private config: ConfigService
	) {}

	/***** EMAIL *****/
	async signup(dto: AuthDTO) {
		// Hash the password
		const hashed = await argon.hash(dto.password);

		// Check if username was provided
		if (dto.username === undefined || dto.username === "")
			dto.username = await this.getRandomName();

		try {
			// Add user to the db
			const user = await this.prisma.user.create({
				data: {
					email: dto.email,
					password: hashed,
					username: dto.username,
					status: 'offline'
				},
			});
			delete user.password;

			// Return useer
			return { user };
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2002')
					throw new ForbiddenException('Credentials Taken')
			}
			throw error;
		}
	}

	async login(dto: AuthDTO) {
		// Fetch user from db
		const user = await this.prisma.user.findUnique({
			where: {
				email: dto.email,
			}
		});
		
		// Check if user exists
		if (!user)
			throw new ForbiddenException('User does not exist');

		// Check if the user is already logged in
		if (user.status !== 'offline')
			throw new ForbiddenException('User already logged in');

		// Check if the password if valid
		const validPassword = await argon.verify(user.password, dto.password);
		if (!validPassword)
			throw new ForbiddenException('Invalid Password');

		// Update user status
		await this.prisma.user.update({
			where: { email: dto.email },
			data: { status: 'online' }
		});

		const access_token = await this.signToken(user.id, user.email);
		return {
			access_token,
			email: user.email,
			username: user.username,
		};
	}

	/***** GOOGLE *****/
	async googleLogin(data: any) {
		console.log(data);
		// Check if the user already exists in the database
		let user = await this.prisma.user.findUnique({
			where: { email: data.email }
		})

		// If the user is not found, add it to the database
		if (!user) {
			try {
				let user_name = data.firstName.toLowerCase() + '_' + data.lastName.toLowerCase();
				// Check if there is already an user with this user_name
				const taken_user_name = await this.prisma.user.findUnique({
					where: { username: user_name }
				});
	
				// If the username is already taken, generate a random one
				if (taken_user_name)
					user_name = await this.getRandomName();

					// Add user to the db
				user = await this.prisma.user.create({
					data: {
						email: data.email,
						password: '',
						username: user_name,
						status: 'online'
					}
				});
			} catch (error) {
				if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002')
					throw new ForbiddenException('Credentials Taken')
				throw error;
			}
		} else {
			await this.prisma.user.update({
				where: { email: data.email },
				data: { status: 'online' }
			});
		}

		const access_token = await this.signToken(user.id, user.email);
		return {
			access_token,
			email: user.email,
			username: user.username,
		};
	}


	/*** USING RANDOM NAME GENERATOR API ***/
	private async getRandomName(): Promise<string> {
		const { data } = await firstValueFrom(
			this.httpService.get('https://randomuser.me/api/').pipe(
			  catchError(() => {
				throw new ForbiddenException('Missing username');
			  }),
			),
		);
		const username = data.results[0]?.login?.username;
		return username;
	}

	async signToken(id: number, email: string): Promise<string> {
		const payload = {
			sub: id,
			email,
		};

		const access_token = await this.jwt.signAsync(payload, {
			expiresIn: '15m',
			secret: this.config.get('JWT_SECRET'),
		});

		return access_token;
	}
}
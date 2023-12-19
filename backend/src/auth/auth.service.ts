import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
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
					avatar: '#',
					status: "OFFLINE"
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
		// if (user.status !== "OFFLINE")
		// 	throw new ForbiddenException('User already logged in');

		// Check if the password if valid
		const validPassword = await argon.verify(user.password, dto.password);
		if (!validPassword)
			throw new ForbiddenException('Invalid Password');

		// Update user status
		await this.prisma.user.update({
			where: { email: dto.email },
			data: { status: "ONLINE" }
		});

		const access_token = await this.signToken(user.id, user.email, '10m');
		const refresh_token = await this.signToken(user.id, user.email, '24h');
		return {
			access_token,
			refresh_token,
			email: user.email,
			username: user.username,
		};
	}

	/***** GOOGLE *****/
	async googleLogin(data: any) {
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
						avatar: data.picture,
						status: "ONLINE",
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
				data: { status: "ONLINE" }
			});
		}

		const access_token = await this.signToken(user.id, user.email, '10m');
		const refresh_token = await this.signToken(user.id, user.email, '24h');
		return {
			access_token,
			refresh_token,
			email: user.email,
			username: user.username,
			avatar: user.avatar
		};
	}

	/***** 42 *****/

	async login42(user)
    {
        const profile = await this.prisma.user.upsert({
            create: {
                email: user.email,
                password: '',
                username: user.username,
                status: 'ONLINE',
                avatar: user.avatar,
            },
            update: {
                status: 'ONLINE',
            },
            where : {
                email: user.email,
            }
        })

		const accessToken = await this.signToken(profile.id, profile.email, '10m');
		const refresh_token = await this.signToken(user.id, user.email, '24h');

     	return { ...profile, accessToken, refresh_token };
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

	async signToken(id: string, email: string, duration: any): Promise<string> {
		const payload = {
			sub: id,
			email,
		};

		const access_token = await this.jwt.signAsync(payload, {
			expiresIn: duration,
			secret: this.config.get('JWT_SECRET'),
		});

		return access_token;
	}

	/***** LOGOUT *****/

	async logout(accessToken: string) {
		if (!accessToken)
			throw new ForbiddenException('No access token');
		const decoded = this.jwt.decode(accessToken);
		const check = await this.prisma.blacklist.findUnique({where: {token: accessToken}});
		if (!check)
		{
			const blackToken = await this.prisma.blacklist.create({data: {
				email: decoded['email'],
				token: accessToken,
				expiresIn: decoded['exp'],
			}})
		}
		//await setTimeout(async () => {
		//	await this.prisma.blacklist.delete({where: {token: accessToken}})
		//}, 15 * 60 * 1000);
		const now = Math.floor(Date.now() / 1000);
		await this.prisma.blacklist.deleteMany({where: {expiresIn: {lte: now}}});
		const user = this.prisma.user.update({
			data:{
				status: 'OFFLINE',
			},
			where: {
				email: decoded['email'],
			}})
		return user;	
	}

	/***** REFRESH *****/
	async refresh(refreshToken: string, accessToken: string) {
		const refreshDecoded = await this.jwt.decode(refreshToken);
		const accessDecoded = await this.jwt.decode(accessToken);	
		
		const now = Math.floor(Date.now() / 1000);

		if (accessDecoded.exp > now)
			throw new UnauthorizedException('Access token is not expired');

		//validate refresh token
		if (refreshDecoded.exp < now)
			throw new UnauthorizedException('Invalid refresh token');

		const user = await this.prisma.user.findUnique({where: {email: refreshDecoded.email}});

		if (!user)
			throw new UnauthorizedException('Invalid refresh token');

		await this.prisma.blacklist.deleteMany({where: {expiresIn: {lte: now}}});
		
		const blacklisted = await this.prisma.blacklist.findUnique({where: {token: refreshToken}})

		if (blacklisted)
		{
			return {newAccessToken: '', newRefreshToken: ''};
		}

		await this.prisma.blacklist.create({data: {
			token: refreshToken,
			email: refreshDecoded.email,
			expiresIn: refreshDecoded.exp,
		}})

		const newAccessToken = await this.signToken(user.id, user.email, '10m');
		const newRefreshToken = await this.signToken(user.id, user.email, refreshDecoded.exp - now);


		return { newAccessToken, newRefreshToken };
	}
}
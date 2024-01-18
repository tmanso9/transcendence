import { HttpService } from '@nestjs/axios';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AuthService } from 'src/auth/auth.service';
import { AuthDTO } from 'src/auth/dto';

@Injectable()
export class DbService {
	constructor(
		private prisma: PrismaService,
		private httpService: HttpService,
		private authService: AuthService
	) {}

	async populate(num: number) {
		// Check if DB is already populated
		if (await this.prisma.user.count() > 20)
			throw new ForbiddenException('Database Already populated');
		if (num > 20)
			throw new ForbiddenException('Number too large');

		for (let i = 0; i < num; i++) {
			const user: AuthDTO = await this.getRandomUser();
			await this.authService.signup(user);
		}
	}

	private async addToDb(user: any) {
		// Hash the password
		const hashed = await argon.hash(user.password);

		try {
			// Add user to the db
			const achievements = {
				social: "",
				games_played: "",
				ratio: "",
				streak: ""
			};
			const new_user = await this.prisma.user.create({
				data: {
					email: user.email,
					password: hashed,
					username: user.username,
					avatar: '#',
					status: "OFFLINE",
					achievements: achievements,
					login: "REGULAR",
					tfa_enabled: false,
					tfa_secret: ''
				},
			});
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2002')
					throw new ForbiddenException('Credentials Taken')
			}
			throw error;
		}
	}

	private async getRandomUser(): Promise<AuthDTO> {
		const { data }: any = await firstValueFrom(
			this.httpService.get('https://randomuser.me/api/').pipe(
			  catchError(() => {
				throw new ForbiddenException('Error fetching data');
			  }),
			),
		);

		const user = {
			email: data.results[0]?.email,
			password: data.results[0]?.login.username.slice(0, 3),
			username: data.results[0]?.login.username,
		};

		return user;
	}
}

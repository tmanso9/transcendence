import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor(config: ConfigService) {
		super({
			clientID: config.get('GOOGLE_AUTH_ID'),
			clientSecret: config.get('GOOGLE_AUTH_SECRET'),
			callbackURL: `${process.env.HOST}:${process.env.BE_PORT}/auth/google/redirect`,
			scope: ['email', 'profile'],
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback): Promise<any> {
		const { name, emails, photos } = profile;
		const user = {
			email: emails[0].value,
			firstName: name.givenName,
			lastName: name.familyName,
			picture: photos[0].value,
			accessToken
		};
		done(null, user);
	}
}
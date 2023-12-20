import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-42';

@Injectable()
export class Strategy42 extends PassportStrategy(Strategy, '42') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('FTLOGIN_CLIENT_UID'),
      clientSecret: configService.get<string>('FTLOGIN_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3000/auth/callback',
      scope: ['public'],
    });
  }

  async validate(accessToken: string, _refreshToken: string, profile: Profile) {
    const user = {
        email: profile.emails[0].value,
        username: profile.username,
        avatar: profile._json.image.link,
        accessToken
    }
    return user;
  }
}
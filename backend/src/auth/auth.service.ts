import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDTO } from './dto';
import * as argon from 'argon2';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { User } from '@prisma/client';
import * as fs from 'fs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  private logger: Logger = new Logger('Auth Log');

  /***** EMAIL *****/
  async signup(dto: AuthDTO) {
    this.validatePassword(dto.password);

    // Hash the password
    const hashed = await argon.hash(dto.password);

    // Check if username was provided
    if (dto.username === undefined || dto.username === '')
      dto.username = await this.getRandomName();
    else this.validateUsername(dto.username);

    try {
      const achievements = {
				social: "",
				games_played: "",
				ratio: "",
				streak: ""
			};
      // Add user to the db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashed,
          username: dto.username,
          avatar: '#',
          status: 'OFFLINE',
          login: 'REGULAR',
          tfa_enabled: false,
          tfa_secret: '',
          achievements: achievements
        },
      });
      delete user.password;

      // Return useer
      return { user };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ForbiddenException('Credentials Taken');
      }
      throw error;
    }
  }

  async login(dto: AuthDTO) {
    // Fetch user from db
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // Check if user exists
    if (!user) throw new ForbiddenException('User does not exist');

    const validPassword = await argon.verify(user.password, dto.password);
    if (!validPassword) throw new ForbiddenException('Invalid Password');

    // Update user status
    if (!user.tfa_enabled) {
      await this.prisma.user.update({
        where: { email: dto.email },
        data: { status: 'ONLINE' },
      });
    }

    let access_token = '';
    let refresh_token = '';

    if (!user.tfa_enabled) {
      access_token = await this.signToken(user, '10m');
      refresh_token = await this.signToken(user, '24h');
    }

    return {
      access_token,
      refresh_token,
      user,
    };
  }

  /***** GOOGLE *****/
  async googleLogin(data: any) {
	let firstLogin = false;

    // Check if the user already exists in the database
    let user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    // If the user is not found, add it to the database
    if (!user) {
      try {
        let user_name =
          data.firstName.toLowerCase() + '_' + data.lastName.toLowerCase();
        // Check if there is already an user with this user_name
        const taken_user_name = await this.prisma.user.findUnique({
          where: { username: user_name },
        });
        // If the username is already taken, generate a random one
        if (taken_user_name) user_name = await this.getRandomName();
        const avatar = `${user_name}_${Date.now()
          .toLocaleString()
          .replaceAll(',', '_')}.png`;
        await this.downloadImage(data.picture, `./public/${avatar}`)
          .then(() => {})
          .catch((error) => {
            console.error('Error:', error);
          });
        // Add user to the db
        const achievements = {
          social: "",
          games_played: "",
          ratio: "",
          streak: ""
        }
        user = await this.prisma.user.create({
          data: {
            email: data.email,
            password: '',
            username: user_name,
            avatar: `http://localhost:3000/${avatar}`,
            status: 'ONLINE',
            login: 'GOOGLE',
            tfa_enabled: false,
            tfa_secret: '',
            achievements: achievements
          },
        });
        firstLogin = true;
      } catch (error) {
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === 'P2002'
        )
          throw new ForbiddenException('Credentials Taken');
        throw error;
      }
    } else if (!user.tfa_enabled) {
      await this.prisma.user.update({
        where: { email: data.email },
        data: { status: 'ONLINE' },
      });
    }

    let access_token = '';
    let refresh_token = '';

    if (!user.tfa_enabled) {
      access_token = await this.signToken(user, '10m');
      refresh_token = await this.signToken(user, '24h');
    }

    return {
      access_token,
      refresh_token,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      tfa: user.tfa_enabled,
	  firstLogin
    };
  }

  /***** 42 *****/
  async login42(user) {
	let firstLogin = false;

    let profile = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!profile) {
      const avatar = `${user.username}_${Date.now()
        .toLocaleString()
        .replaceAll(',', '_')}.png`;
      await this.downloadImage(user.avatar, `./public/${avatar}`)
        .then(() => {})
        .catch((error) => {
          console.error('Error:', error);
        });
      const achievements = {
        social: "",
        games_played: "",
        ratio: "",
        streak: ""
      };
      profile = await this.prisma.user.create({
        data: {
          email: user.email,
          password: '',
          username: user.username,
          status: 'ONLINE',
          avatar: `http://localhost:3000/${avatar}`,
          login: 'FORTYTWO',
          tfa_enabled: false,
          tfa_secret: '',
          achievements: achievements
        },
      });
      firstLogin = true;
    } else if (!profile.tfa_enabled) {
      profile = await this.prisma.user.update({
        where: { email: user.email },
        data: { status: 'ONLINE' },
      });
    }

    let accessToken = '';
    let refresh_token = '';

    if (!profile.tfa_enabled) {
      accessToken = await this.signToken(profile, '10m');
      refresh_token = await this.signToken(profile, '24h');
    }

    return { ...profile, accessToken, refresh_token, firstLogin };
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

  async signToken(user: any, duration: any): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: duration,
      secret: this.config.get('JWT_SECRET'),
    });

    return access_token;
  }

  async logout(accessToken: string) {
    if (!accessToken) throw new ForbiddenException('No access token');
    const decoded = this.jwt.decode(accessToken);
    const check = await this.prisma.blacklist.findFirst({
      where: { token: accessToken },
    });
    if (!check) {
      const blackToken = await this.prisma.blacklist.create({
        data: {
          email: decoded['email'],
          token: accessToken,
          expiresIn: decoded['exp'],
        },
      });
    }

    const now = Math.floor(Date.now() / 1000);
    await this.prisma.blacklist.deleteMany({
      where: { expiresIn: { lte: now } },
    });
    const user = this.prisma.user.update({
      data: {
        status: 'OFFLINE',
      },
      where: {
        email: decoded['email'],
      },
    });
    return user;
  }

  async refresh(refreshToken: string, accessToken: string) {
    const refreshDecoded = await this.jwt.decode(refreshToken);
    const accessDecoded = await this.jwt.decode(accessToken);

    const now = Math.floor(Date.now() / 1000);

    if (accessDecoded.exp > now)
      throw new UnauthorizedException('Access token is not expired');

    if (!refreshDecoded)
      throw new UnauthorizedException('Invalid refresh token format');

    const user = await this.prisma.user.findUnique({
      where: { email: refreshDecoded.email },
    });
    if (!user) throw new UnauthorizedException('Invalid refresh token');

    //validate refresh token
    if (refreshDecoded.exp < now) {
      await this.prisma.user.update({
        data: { status: 'OFFLINE' },
        where: { email: user.email },
      });
      throw new UnauthorizedException('Expired refresh token');
    }

    await this.prisma.blacklist.deleteMany({
      where: { expiresIn: { lte: now } },
    });

    const blacklisted = await this.prisma.blacklist.findFirst({
      where: { token: refreshToken },
    });

    if (blacklisted) {
      const updatedUser = await this.prisma.user.update({
        data: { status: 'BLOCKED' },
        where: { email: user.email },
      });
      return { newAccessToken: '', newRefreshToken: '', updatedUser };
    }

    await this.prisma.blacklist.create({
      data: {
        token: refreshToken,
        email: refreshDecoded.email,
        expiresIn: refreshDecoded.exp,
      },
    });

    const newAccessToken = await this.signToken(user, '10m');
    const newRefreshToken = await this.signToken(
      user,
      refreshDecoded.exp - now,
    );

    return { newAccessToken, newRefreshToken, user };
  }

  /***** TWO FACTOR AUTHENTICATION *****/

  async generateTwoFactorAuthenticationSecret(user: any) {
    const secret = authenticator.generateSecret();

    const otpAuthUrl = authenticator.keyuri(
      user.email,
      'Transcendence',
      secret,
    );

    await this.prisma.user.update({
      where: { email: user.email },
      data: { tfa_secret: secret },
    });

    return otpAuthUrl;
  }

  generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }

  async turnOnTwoFactorAuthentication(user: any) {
    const newUser = await this.prisma.user.update({
      where: { email: user.email },
      data: { tfa_enabled: true },
    });
    return newUser;
  }

  async turnOffTwoFactorAuthentication(user: any) {
    const newUser = await this.prisma.user.update({
      where: { email: user.email },
      data: { tfa_enabled: false },
    });
    return newUser;
  }

  isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: any,
  ) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.tfa_secret,
    });
  }

  async login2fa(user: any) {
    const updatedUser = await this.prisma.user.update({
      where: { email: user.email },
      data: { status: 'ONLINE' },
    });

    const access_token = await this.signToken(updatedUser, '10m');
    const refresh_token = await this.signToken(updatedUser, '24h');

    return { access_token, refresh_token, updatedUser };
  }

  /***** UTILS *****/

  async getUserFromEmail(emailToFind: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: emailToFind },
    });
    return user;
  }

  validatePassword(pass: string) {
    if (
      pass.length < 8 ||
      pass === pass.toLowerCase() ||
      pass === pass.toUpperCase() ||
      !/\d/.test(pass)
    )
      throw new ForbiddenException(
        'Password must contain at least 8 characters, 1 Uppercase, 1 Lowercase and 1 digit',
      );
  }

  validateUsername(username: string) {
    if (username.length <= 4 || !/^[a-zA-Z0-9_-]+$/.test(username))
      throw new ForbiddenException(
        'Username must be at least 5 characters long and can only have alphanumeric characters or -/_',
      );
  }

  async getUserFromToken(token: string) {
    const decoded = this.jwt.decode(token);
    if (!decoded) throw new ForbiddenException('decoded error');
    const user = await this.prisma.user.findUnique({
      where: { email: decoded.email },
      include: {
        friends: true,
        channels: {
          include: {
            members: true,
            admins: true,
            bannedUsers: true,
            mutedUsers: true,
          },
        },
        adminOf: true,
        bannedFrom: true,
        mutedOn: false,
      },
    });
    if (!user) throw new ForbiddenException('user error');
    return user;
  }

  async downloadImage(url: string, filename: string) {
    const writer = fs.createWriteStream(filename);

    const response = await this.httpService.axiosRef({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }
}

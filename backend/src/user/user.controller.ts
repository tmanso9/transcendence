import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from '../auth/guards';
import { getUser } from '../auth/decorator';
import { decodeJwt } from './decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { notificationsGateway } from './user.gateway';

@Controller('users')
export class UserController {
  constructor(
    private userService: UserService,
    private notificationsGateway: notificationsGateway,
  ) {}

  @Get()
  async getUsers() {
    return this.userService.getUsers();
  }

	@UseGuards(JwtGuard)
	@Get('gamestats/:username')
	getUserGamestats(@Param('username') username: string) {
		return this.userService.getUserGamestats(username);
	}

  @UseGuards(JwtGuard)
	@Get('achievements/:username')
	getUserAchievements(@Param('username') username: string) {
		return this.userService.getUserAchievements(username);
	}

	@UseGuards(JwtGuard)
	@Get('me')
	getMe(@getUser() user: any) {
		return this.userService.getMe(user);
	}

	@UseGuards(JwtGuard)
	@Get('me/friends')
	getFriends(@decodeJwt('sub') id: string) {
		return this.userService.getFriends(id);
	}

	// Get user channels
	@UseGuards(JwtGuard)
	@Get('me/channels')
	async getUserChannels(@decodeJwt('sub') id: string) {
		return this.userService.getUserChannels(id);
	}

	// Get user channels
	@UseGuards(JwtGuard)
	@Get('me/other-channels')
	async getNonUserChannels(@decodeJwt('sub') id: string) {
		return this.userService.getNonUserChannels(id);
	}

  @UseGuards(JwtGuard)
  @Get('connections')
  async getPending() {
    const pending = await this.userService.getPending();
    return pending;
  }

  @UseGuards(JwtGuard)
  @Get(':username')
  getUserById(@Param('username') username: string) {
    return this.userService.getUserById(username);
  }

  @UseGuards(JwtGuard)
  @Get('dismiss-alert/alert?')
  dismissAlert(
    @Query('id') id: string,
  ) {
    return this.userService.dismissAlert(id);
  }

  // Send Friend Request
  @UseGuards(JwtGuard)
  @Post('friend-request/:id')
  async requestFriend(
    @Param('id') user_id: any,
    @decodeJwt() decoded_jwt: any,
  ) {
    await this.userService.requestFriend(user_id, decoded_jwt);
    const socket = this.notificationsGateway.usersConnected.get(user_id);
    if (socket) socket.emit('newAlert');
    return HttpCode(201);
  }

  // Respond to Friend Request
  @UseGuards(JwtGuard)
  @Post('friend-response/:id/:action')
  async respondFriend(@Param('id') user_id: any, @Param('action') action: any, @decodeJwt() decoded_jwt: any) {
    await this.userService.respondFriend(user_id, action, decoded_jwt);
    const socket = this.notificationsGateway.usersConnected.get(user_id);
    if (socket) socket.emit('newAlert');
    return HttpCode(201);
  }

  // Remove Friends
  @UseGuards(JwtGuard)
  @Post('remove-friend/:id')
  async removeFriend(@Param('id') user_id: any, @decodeJwt() decoded_jwt: any) {
    await this.userService.removeFriend(user_id, decoded_jwt);
    const socket = this.notificationsGateway.usersConnected.get(user_id);
    if (socket) socket.emit('newAlert');
    return HttpCode(201);
  }

  // Send Game Request
  @UseGuards(JwtGuard)
  @Post('game-request/:id')
  async requestGame(@Param('id') user_id: any, @decodeJwt() decoded_jwt: any) {
    const alertId = await this.userService.gameRequest(user_id, decoded_jwt);
    const socket = this.notificationsGateway.usersConnected.get(user_id);
    if (socket) socket.emit('newAlert');
    return alertId;
  }

  // Reject Game Request
  @UseGuards(JwtGuard)
  @Post('game-reject/:id')
  async rejectGame(@Param('id') user_id: any, @decodeJwt() decoded_jwt: any) {
    await this.userService.gameReject(user_id, decoded_jwt);
    const socket = this.notificationsGateway.usersConnected.get(user_id);
    if (socket) socket.emit('newAlert');
    return HttpCode(201);
  }

  @UseGuards(JwtGuard)
  @Post('change-username')
  async changeUsername(@getUser() user: any, @Body() body: any) {
    const updated = await this.userService.changeUsername(user, body.username);
    return updated;
  }

  @UseGuards(JwtGuard)
  @Post('change-password')
  async changePassword(@getUser() user: any, @Body() body: any) {
    const updated = await this.userService.changePassword(
      user,
      body.password,
      body.currentPwd,
    );
    return updated;
  }

  @UseGuards(JwtGuard)
  @Post('change-avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './public',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async changeAvatar(
    @UploadedFile() file: Express.Multer.File,
    @getUser() user: any,
  ) {
    const me = this.getMe(user);
    await this.userService.changeAvatar(
      me,
      `${process.env.HOST}:${process.env.BE_PORT}/${file.filename}`,
    );
    return true;
  }
}

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChannelsService } from './channels.service';
import { ForbiddenException, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { Channels, User } from '@prisma/client';
import { Client } from 'socket.io/dist/client';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChannelsGateway {
  constructor(
    private readonly channelsService: ChannelsService,
    private prisma: PrismaService,
    private authService: AuthService,
    private userService: UserService,
  ) {}
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('Chat Log');

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string): string {
    return data;
  }

  @SubscribeMessage('checkTokenConection')
  async checkTokenConection(
    @ConnectedSocket() client: Socket,
    @MessageBody() tokenKey: string,
  ) {
    try {
      const payload = await this.authService.getUserFromToken(tokenKey);
      if (payload) return payload;
    } catch (error) {
      return 0;
    }
  }

  @SubscribeMessage('publicChannelsUserIsNotIn')
  async allPublicChannelsUserIsNotIn(
    @ConnectedSocket() Client: Socket,
    @MessageBody() data: { token: string; userId: string },
  ): Promise<Channels[]> {
    try {
      const payload = await this.authService.getUserFromToken(data.token);
      const publicChannels = await this.prisma.channels.findMany({
        where: { type: 'public' },
        include: {
          members: true,
          admins: true,
          bannedUsers: true,
          mutedUsers: true,
        },
      });
      let channelsUserIsNotIn: Channels[] = [];
      publicChannels.map((channel) => {
        let userIsMember = 0;
        channel.members.map((member) => {
          if (member.id == data.userId) userIsMember = 1;
        });
        if (!userIsMember) channelsUserIsNotIn.push(channel);
      });
      this.logger.debug(channelsUserIsNotIn.length);
      return channelsUserIsNotIn;
    } catch (error) {
      this.logger.debug(error);
      return [];
    }
  }
}

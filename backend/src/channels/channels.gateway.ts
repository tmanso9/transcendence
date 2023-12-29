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

  @SubscribeMessage('publicChannels')
  async allPublicChannels(
    @ConnectedSocket() Client: Socket,
    @MessageBody() data: { tokenKey: string; userId: string },
  ): Promise<Channels[]> {
    try {
      const payload = await this.authService.getUserFromToken(data.tokenKey);
      const publicChannels = this.prisma.channels.findMany({
        where: { type: 'public' },
      });
      return publicChannels;
    } catch (error) {
      return [];
    }
  }
}

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChannelsService } from './channels.service';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

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

  @SubscribeMessage('test')
  async testFunc(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string,
  ): Promise<undefined> {
    this.server.emit('test', 'ola, eu sou o server');
    const payload = this.authService.verify(
      client.handshake.headers.authorization,
    );
    const user = await this.userService.getUserById(payload.userId);
    this.logger.debug(client.handshake.headers.authorization);
  }
}

import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChannelsService } from './channels.service';
import { Logger } from '@nestjs/common';
import { Server } from 'http';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChannelsGateway {
  constructor(
    private readonly channelsService: ChannelsService,
    private prisma: PrismaService,
  ) {}
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('Chat Log');

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string): string {
    return data;
  }

  @SubscribeMessage('test')
  testFunc(@MessageBody() data: string): undefined {
    this.server.emit('test', 'ola, eu sou o server');
    this.logger.debug('hi, im chat debug');
  }
}

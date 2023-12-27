import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChannelsService } from './channels.service';
import { Logger } from '@nestjs/common';
import { Server } from 'http';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChannelsGateway {
  constructor(private readonly channelsService: ChannelsService) {}
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('Chat Log');

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string): string {
    return data;
  }
}

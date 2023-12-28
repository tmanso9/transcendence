import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChannelsService } from './channels.service';
import { Server } from 'socket.io'
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards';

@UseGuards(JwtGuard)
@WebSocketGateway({ namespace: 'chat' })
export class ChannelsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly channelsService: ChannelsService) {}

  @SubscribeMessage('message')
  handleEvent(@MessageBody() data: string): string {
    console.log('Received', data);
    console.log('Sending', data.toUpperCase());
    this.server.emit('message', data.toUpperCase());
    return data.toUpperCase();
  }
}

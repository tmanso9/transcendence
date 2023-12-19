import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { ChannelsService } from './channels.service';

@WebSocketGateway()
export class ChannelsGateway {
  constructor(private readonly channelsService: ChannelsService) {}

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string): string {
    return data;
  }
}

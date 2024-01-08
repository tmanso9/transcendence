import { Server, Socket } from 'socket.io';
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway({ namespace: '/notifications', cors: { origin: 'http://localhost:3001' } })
export class userGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  usersConnected: Map<string, Socket> = new Map();

  @SubscribeMessage('userInfo')
  registerUser(client: any, payload: any) {
    this.usersConnected.set(payload, client);
  }

  handleConnection(client: any, ...args: any[]) {}
}

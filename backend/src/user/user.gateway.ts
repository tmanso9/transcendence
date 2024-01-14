import { Server, Socket } from 'socket.io';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: 'http://localhost:3001' },
})
export class notificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  usersConnected: Map<string, Socket> = new Map();

  @SubscribeMessage('userInfo')
  registerUser(client: any, payload: any) {
    this.usersConnected.set(payload, client);
  }

  handleConnection(client: any, ...args: any[]) {}
}

@WebSocketGateway({
  namespace: '/login',
  cors: { origin: 'http://localhost:3001' },
})
export class userGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server
  users: Map<Socket, String> = new Map();
  constructor(private prismaService: PrismaService){
	this.prismaService = prismaService
  }
  
  @SubscribeMessage('setOnline')
  async setOnline(client: any, username: any) {
    if (username.length) {
      this.users.set(client.id, username);
      await this.prismaService.user.update({
        where: {
          username,
        },
        data: {
          status: 'ONLINE',
        },
      });
    }
  }

  async setOffline(username: any) {
    setTimeout(async () => {
      if (username && username.length) {
        await this.prismaService.user.update({
          where: {
            username,
          },
          data: {
            status: 'OFFLINE',
          },
        });
      }
    }, 100);
  }

  handleConnection(client: any, ...args: any[]) {}

  handleDisconnect(client: any) {
    if (this.users.has(client.id)) {
      this.setOffline(this.users.get(client.id));
	  this.users.delete(client.id);
    }
  }
}

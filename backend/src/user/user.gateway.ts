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
  cors: { origin: `${process.env.HOST}:${process.env.FE_PORT}` },
})
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  usersConnected: Map<string, Socket> = new Map();

  @SubscribeMessage('userInfo')
  registerUser(client: any, payload: any) {
    this.usersConnected.set(payload, client);
  }

  handleConnection() {}
}

@WebSocketGateway({
  namespace: '/login',
  cors: { origin: `${process.env.HOST}:${process.env.FE_PORT}` },
})
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  users: Map<Socket, string> = new Map();
  constructor(private prismaService: PrismaService) {
    this.prismaService = prismaService;
  }

  @SubscribeMessage('setOnline')
  async setOnline(client: any, id: any) {
    if (client && id && id.length) {
      this.users.set(client.id, id);
      await this.prismaService.user.update({
        where: {
          id,
        },
        data: {
          status: 'ONLINE',
        },
      });
    }
  }

  async setOffline(id: any) {
    setTimeout(async () => {
      if (id && id.length) {
        await this.prismaService.user.update({
          where: {
            id,
          },
          data: {
            status: 'OFFLINE',
          },
        });
      }
    }, 10);
  }

  handleConnection() {}

  handleDisconnect(client: any) {
    if (this.users.has(client.id)) {
      this.setOffline(this.users.get(client.id));
      this.users.delete(client.id);
    }
  }
}

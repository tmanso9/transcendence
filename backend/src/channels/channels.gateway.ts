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

class Message {
  sender: string;
  content: string;
  date: string;
}

type JsonValue = {
  sender: string;
  content: string;
  date: string;
};

const clientsMap: Map<string, Socket> = new Map();

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

  @SubscribeMessage('checkTokenConection')
  async checkTokenConection(
    @ConnectedSocket() client: Socket,
    @MessageBody() tokenKey: string,
  ) {
    try {
      const payload = await this.authService.getUserFromToken(tokenKey);
      if (payload) {
        const prismaClientId = payload.id;

        // Associate the WebSocket connection with the Prisma ID in the map
        clientsMap.set(prismaClientId, client);
        return payload;
      }
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

  @SubscribeMessage('channelMessages')
  async channelMessages(
    @ConnectedSocket() Client: Socket,
    @MessageBody()
    data: {
      token: string;
      option: 'get' | 'send';
      channelId: string;
      message: string;
    },
  ): Promise<Message[]> {
    try {
      const user = await this.authService.getUserFromToken(data.token);
      const channel = await this.prisma.channels.findFirst({
        where: {
          id: data.channelId,
        },
      });
      if (!channel) throw new ForbiddenException('no channel found');
      let messages: Message[] = [];
      if (data.option == 'send' && data.message != '') {
        const updatedChannel = await this.prisma.channels.update({
          where: {
            id: channel.id,
          },
          data: {
            messages: {
              push: {
                sender: user.username,
                content: data.message,
                date: '',
              },
            },
          },
          include: {
            members: true,
          },
        });
        updatedChannel.messages.map((msg: JsonValue) => {
          messages.push({
            sender: msg.sender,
            content: msg.content,
            date: msg.date,
          });
        });
        updatedChannel.members.map((member) => {
          if (member.id != user.id) {
            const client = clientsMap.get(member.id);
            if (client && client.connected) {
              client.emit('channelMessages', messages);
            }
          }
        });
      } else if (data.option == 'get') {
        channel.messages.map((msg: JsonValue) => {
          messages.push({
            sender: msg.sender,
            content: msg.content,
            date: msg.date,
          });
        });
      }
      return messages;
    } catch (error) {
      this.logger.debug(error);
      return [];
    }
  }

  @SubscribeMessage('joinChannel')
  async joinChannel(
    @ConnectedSocket() Client: Socket,
    @MessageBody()
    data: {
      token: string;
      channelId: string;
    },
  ): Promise<Channels[]> {
    try {
      const user = await this.authService.getUserFromToken(data.token);
      const channel = await this.prisma.channels.findFirst({
        where: {
          id: data.channelId,
        },
        include: {
          members: true,
          admins: true,
          bannedUsers: true,
          mutedUsers: true,
        },
      });
      if (!user || !channel)
        throw new ForbiddenException('problem with user or channel');
      channel.bannedUsers.map((bannedUser) => {
        if (bannedUser.id == user.id)
          throw new ForbiddenException('user is banned from this channel');
      });
      channel.members.map((member) => {
        if (member.id == user.id)
          throw new ForbiddenException('user is already member of channel');
      });
      await this.prisma.channels.update({
        where: { id: channel.id },
        data: {
          members: {
            connect: { id: user.id },
          },
        },
      });
      const updatedUser = await this.prisma.user.findFirst({
        where: { id: user.id },
        include: {
          channels: {
            include: {
              members: true,
              admins: true,
              bannedUsers: true,
              mutedUsers: true,
            },
          },
        },
      });
      return updatedUser.channels;
    } catch (error) {
      this.logger.debug(error);
      return undefined;
    }
  }
}

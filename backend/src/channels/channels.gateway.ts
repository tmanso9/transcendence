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
import * as argon from 'argon2';

class Message {
  sender: string;
  content: string;
  date: string;
  read: string[];
}

type JsonValue = {
  sender: string;
  content: string;
  date: string;
};

const clientsMap: Map<string, Socket> = new Map();

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: `${process.env.HOST}:${process.env.FE_PORT}` },
})
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

  async handleBannedAndMutedCleanup(
    channelId: string,
    userId: string,
    option: 'unban' | 'unmute',
  ) {
    this.logger.debug(channelId);
    this.logger.debug(userId);
    this.logger.debug(option);
    try {
      if (option == 'unban') {
        await this.prisma.channels.update({
          where: { id: channelId },
          data: { bannedUsers: { disconnect: { id: userId } } },
        });
      } else {
        await this.prisma.channels.update({
          where: { id: channelId },
          data: { mutedUsers: { disconnect: { id: userId } } },
        });
      }
      clientsMap.forEach((client) => {
        if (client && client.connected) {
          client.emit('updateInfo');
        }
      });
      return 1;
    } catch (error) {
      // Handle errors if needed
      console.error('Error during banned cleanup:', error);
      return 0;
    }
  }

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
      await this.authService.getUserFromToken(data.token);
      const publicChannels = await this.prisma.channels.findMany({
        where: { type: 'public' },
        include: {
          members: true,
          admins: true,
          bannedUsers: true,
          mutedUsers: true,
        },
      });
      const channelsUserIsNotIn: Channels[] = [];
      publicChannels.map((channel) => {
        let userIsMember = 0;
        channel.members.map((member) => {
          if (member.id == data.userId) userIsMember = 1;
        });
        if (!userIsMember) channelsUserIsNotIn.push(channel);
      });
      return channelsUserIsNotIn;
    } catch (error) {
      this.logger.debug('problem in publicChannelsUserIsNotIn');
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
        include: {
          mutedUsers: true,
        },
      });
      const userIsMuted = [];
      channel.mutedUsers.map((mutedUser) => {
        if (mutedUser.id == user.id) userIsMuted.push(true);
      });
      if (!channel) throw new ForbiddenException('no channel found');
      const messages: Message[] = [];
      if (
        data.option == 'send' &&
        data.message != '' &&
        userIsMuted.length == 0
      ) {
        const updatedChannel = await this.prisma.channels.update({
          where: {
            id: channel.id,
          },
          data: {
            messages: {
              push: {
                sender: user.id,
                content: data.message,
                date: '',
                read: [user.id],
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
            read: [msg.sender],
          });
        });
        updatedChannel.members.map((member) => {
          if (member.id != user.id) {
            const client = clientsMap.get(member.id);
            if (client && client.connected) {
              client.emit('channelMessages', {
                id: channel.id,
                messages: messages,
              });
            }
          }
        });
      } else if (data.option == 'get' || userIsMuted.length > 0) {
        channel.messages.map((msg: JsonValue) => {
          messages.push({
            sender: msg.sender,
            content: msg.content,
            date: msg.date,
            read: [msg.sender],
          });
        });
      }
      return messages;
    } catch (error) {
      this.logger.debug('problem in channelMessages');
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
      password: string;
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
      this.logger.debug(1);
      if (channel.password != '') {
        const validPassword = await argon.verify(
          channel.password,
          data.password,
        );
        if (!validPassword) {
          throw new ForbiddenException('wrong password - cant join');
        }
      }
      const updatedChannel = await this.prisma.channels.update({
        where: { id: channel.id },
        data: {
          members: {
            connect: { id: user.id },
          },
        },
        include: {
          members: true,
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
      updatedChannel.members.map((member) => {
        if (member.id != user.id) {
          const client = clientsMap.get(member.id);
          if (client && client.connected) {
            client.emit('updateInfo');
          }
        }
      });
      return updatedUser.channels;
    } catch (error) {
      console.log(error);
      this.logger.debug(error);
      return undefined;
    }
  }

  @SubscribeMessage('createChannel')
  async createChannel(
    @ConnectedSocket() Client: Socket,
    @MessageBody()
    data: {
      token: string;
      type: 'public' | 'private' | 'personal';
      password: string;
      channelName: string;
      members: User[];
    },
  ): Promise<string> {
    try {
      const user = await this.authService.getUserFromToken(data.token);
      if (!user) throw new ForbiddenException('user is not logged in');
      if (data.type == 'personal' && data.members.length != 1)
        throw new ForbiddenException(
          'personal channel must have have exactly 2 mebers',
        );
      if (data.type != 'personal' && data.channelName == '')
        throw new ForbiddenException('non personal channel must have name');
      let channelIdToReturn = '';
      if (data.type != 'personal') {
        if (data.type != 'public' && data.type != 'private')
          throw new ForbiddenException(
            'channel type must be: "personal", "private" or "public"',
          );
        const hash = data.password == '' ? '' : await argon.hash(data.password);
        const newChannel = await this.prisma.channels.create({
          data: {
            creator: user.id,
            type: data.type,
            avatar: 'mdi-account-group',
            password: hash,
            channelName: data.channelName,
            members: {
              connect: { id: user.id },
            },
            admins: {
              connect: { id: user.id },
            },
          },
        });
        if (!newChannel)
          throw new ForbiddenException('problem creating channel');
        channelIdToReturn = newChannel.id;
        data.members.map(async (member) => {
          const updatedChannel = await this.prisma.channels.update({
            where: { id: newChannel.id },
            data: {
              members: {
                connect: { id: member.id },
              },
            },
          });
          if (!updatedChannel)
            throw new ForbiddenException('problem conecting member');
        });
      } else {
        const possibleChannel = await this.prisma.channels.findFirst({
          where: {
            type: 'personal',
            creator: data.members[0].id || user.id,
            members: {
              some: {
                id: user.id || data.members[0].id,
              },
            },
          },
        });
        if (possibleChannel) return possibleChannel.id;
        const newChannel = await this.prisma.channels.create({
          data: {
            creator: user.id,
            type: data.type,
            avatar: 'mdi-account',
            password: '',
            channelName: '',
            members: {
              connect: { id: user.id },
            },
          },
        });
        if (!newChannel)
          throw new ForbiddenException('problem creating personal chat');
        this.logger.debug(4);
        const updatedChannel = await this.prisma.channels.update({
          where: { id: newChannel.id },
          data: {
            members: {
              connect: { id: data.members[0].id },
            },
          },
        });
        channelIdToReturn = updatedChannel.id;
      }
      data.members.map((member) => {
        if (member.id != user.id) {
          const client = clientsMap.get(member.id);
          if (client && client.connected) {
            client.emit('updateInfo');
          }
        }
      });
      return channelIdToReturn;
    } catch (error) {
      this.logger.debug('problem in createChannel');
      return undefined;
    }
  }

  @SubscribeMessage('leaveChannel')
  async leaveChannel(
    @ConnectedSocket() Client: Socket,
    @MessageBody()
    data: {
      token: string;
      channelId: string;
    },
  ): Promise<number> {
    try {
      const user = await this.authService.getUserFromToken(data.token);
      if (!user) throw new ForbiddenException('user not loged in');
      const channel = await this.prisma.channels.findFirst({
        where: {
          id: data.channelId,
        },
        include: {
          members: true,
          admins: true,
        },
      });
      if (!channel) throw new ForbiddenException('channel doesnt exist');
      // delete channel
      if (channel.members.length == 1) {
        await this.prisma.channels.delete({
          where: {
            id: data.channelId,
          },
        });
        return 1;
      }
      // just remove the user (remove it from admins)
      const channels = await this.prisma.channels.update({
        where: {
          id: data.channelId,
        },
        data: {
          creator: '',
          members: {
            disconnect: { id: user.id },
          },
          admins: {
            disconnect: { id: user.id },
          },
        },
      });
      if (!channels) throw new ForbiddenException('user not in this channel');
      const updatedChannel = await this.prisma.channels.findFirst({
        where: {
          id: data.channelId,
        },
        include: {
          members: true,
          admins: true,
        },
      });
      if (!updatedChannel) return 1;
      if (updatedChannel.admins.length == 0) {
        await this.prisma.channels.update({
          where: {
            id: data.channelId,
          },
          data: {
            admins: {
              connect: { id: updatedChannel.members[0].id },
            },
          },
        });
      }
      updatedChannel.members.map((member) => {
        const client = clientsMap.get(member.id);
        if (client && client.connected) {
          client.emit('updateInfo');
        }
      });
      return 1;
    } catch (error) {
      this.logger.debug('problem in leaveChannel');
      return 0;
    }
  }

  @SubscribeMessage('banMuteKickUserFromChannnel')
  async banMuteKickUserFromChannnel(
    @ConnectedSocket() Client: Socket,
    @MessageBody()
    data: {
      token: string;
      channelId: string;
      option: 'ban' | 'kick' | 'mute';
      userId: string;
    },
  ): Promise<number> {
    try {
      const user = await this.authService.getUserFromToken(data.token);
      if (!user) throw new ForbiddenException('user not loged in');
      const userIsAdmin = await this.prisma.user.findFirst({
        where: {
          id: user.id,
          adminOf: {
            some: {
              id: data.channelId,
            },
          },
        },
      });
      if (!userIsAdmin) throw new ForbiddenException('user isnt admin');
      const userToBanKickOrMute = await this.prisma.user.findFirst({
        where: {
          id: data.userId,
        },
      });
      if (!userToBanKickOrMute)
        throw new ForbiddenException('user to ban, kick or mute doesnt exist');
      if (data.option == 'ban' || data.option == 'kick') {
        await this.prisma.channels.update({
          where: {
            id: data.channelId,
            NOT: {
              creator: userToBanKickOrMute.id,
            },
          },
          data: {
            members: {
              disconnect: { id: data.userId },
            },
            admins: {
              disconnect: { id: data.userId },
            },
          },
        });
      }
      if (data.option == 'ban') {
        await this.prisma.channels.update({
          where: {
            id: data.channelId,
          },
          data: {
            bannedUsers: {
              connect: { id: data.userId },
            },
          },
        });
        setTimeout(
          () =>
            this.handleBannedAndMutedCleanup(
              data.channelId,
              data.userId,
              'unban',
            ),
          1 * 60 * 1000,
        );
      } else if (data.option == 'mute') {
        await this.prisma.channels.update({
          where: {
            id: data.channelId,
          },
          data: {
            mutedUsers: {
              connect: { id: data.userId },
            },
          },
        });
        setTimeout(
          () =>
            this.handleBannedAndMutedCleanup(
              data.channelId,
              data.userId,
              'unmute',
            ),
          1 * 60 * 1000,
        );
      }
      const updatedChannel = await this.prisma.channels.findFirst({
        where: {
          id: data.channelId,
        },
        include: {
          members: true,
        },
      });
      clientsMap.get(userToBanKickOrMute.id)?.emit('updateInfo');
      updatedChannel.members.map((member) => {
        const client = clientsMap.get(member.id);
        if (client && client.connected) {
          client.emit('updateInfo');
        }
      });
      return 1;
    } catch (error) {
      this.logger.debug('problem in banMuteKickUserFromChannnel');
      return 0;
    }
  }

  @SubscribeMessage('promoteOrDespromoteAdmin')
  async promoteOrDespromoteAdmin(
    @ConnectedSocket() Client: Socket,
    @MessageBody()
    data: {
      token: string;
      channelId: string;
      option: 'promote' | 'despromote';
      userId: string;
    },
  ): Promise<number> {
    try {
      const user = await this.authService.getUserFromToken(data.token);
      if (!user) throw new ForbiddenException('user not loged in');
      const userIsAdmin = await this.prisma.user.findFirst({
        where: {
          id: user.id,
          adminOf: {
            some: {
              id: data.channelId,
            },
          },
        },
      });
      if (!userIsAdmin) throw new ForbiddenException('user isnt admin');
      const userToPromoteOrDespromote = await this.prisma.user.findFirst({
        where: {
          id: data.userId,
        },
      });
      if (!userToPromoteOrDespromote)
        throw new ForbiddenException(
          'user to promote or despromote doesnt exist',
        );
      const channel = await this.prisma.channels.findFirst({
        where: {
          id: data.channelId,
        },
        include: {
          members: true,
        },
      });
      if (!channel || channel.creator == userToPromoteOrDespromote.id)
        throw new ForbiddenException(
          'user to promote or despromote is the creator',
        );
      this.logger.debug('hello4');
      if (data.option == 'promote') {
        this.logger.debug('hello4.1');
        await this.prisma.channels.update({
          where: {
            id: data.channelId,
          },
          data: {
            admins: {
              connect: { id: data.userId },
            },
          },
        });
      } else if (data.option == 'despromote') {
        this.logger.debug('hello4.2');
        await this.prisma.channels.update({
          where: {
            id: data.channelId,
          },
          data: {
            admins: {
              disconnect: { id: data.userId },
            },
          },
        });
      }
      channel.members.map((member) => {
        const client = clientsMap.get(member.id);
        if (client && client.connected) {
          client.emit('updateInfo');
        }
      });
      return 1;
    } catch (error) {
      this.logger.debug('problem in promoteOrDespromoteAdmin');
      return 0;
    }
  }

  @SubscribeMessage('blockOrUnblockUser')
  async blockUser(
    @ConnectedSocket() Client: Socket,
    @MessageBody()
    data: {
      token: string;
      option: 'block' | 'unblock';
      userId: string;
    },
  ): Promise<number> {
    try {
      const user = await this.authService.getUserFromToken(data.token);
      if (!user) throw new ForbiddenException('user not loged in');
      const userToBlockOrUnblock = await this.prisma.user.findFirst({
        where: {
          id: data.userId,
        },
      });
      if (!userToBlockOrUnblock)
        throw new ForbiddenException('user to block doesnt exist');
      if (data.option == 'block') {
        await this.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            blockedUsers: {
              push: userToBlockOrUnblock.id,
            },
          },
        });
      } else {
        const newList = [];
        userToBlockOrUnblock.blockedUsers.map((usr) => {
          if (usr != userToBlockOrUnblock.id) newList.push(usr);
        });
        await this.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            blockedUsers: newList,
          },
        });
      }
      const client = clientsMap.get(user.id);
      if (client && client.connected) {
        client.emit('updateInfo');
      }
      return 1;
    } catch (error) {
      this.logger.debug('problem in blockOrUnblockUser');
      return 0;
    }
  }

  @SubscribeMessage('changeChannelPassword')
  async changeChannelPassword(
    @ConnectedSocket() Client: Socket,
    @MessageBody()
    data: {
      token: string;
      channelId: string;
      password: string;
    },
  ): Promise<number> {
    try {
      const user = await this.authService.getUserFromToken(data.token);
      if (!user) throw new ForbiddenException('user not loged in');
      const channel = await this.prisma.channels.findFirst({
        where: {
          id: data.channelId,
          admins: {
            some: {
              id: user.id,
            },
          },
        },
        include: {
          admins: true,
        },
      });
      if (!channel)
        throw new ForbiddenException(
          'channel doesnt exist or user is not admin',
        );
      const hash = data.password == '' ? '' : await argon.hash(data.password);
      const updatedChannel = await this.prisma.channels.update({
        where: {
          id: data.channelId,
        },
        data: {
          password: hash,
        },
        include: {
          members: true,
        },
      });
      updatedChannel.members.map((member) => {
        const client = clientsMap.get(member.id);
        if (client && client.connected) {
          client.emit('updateInfo');
        }
      });
      return 1;
    } catch (error) {
      this.logger.debug('problem in changeChannelPassword');
      return 0;
    }
  }

  @SubscribeMessage('readChannelMessages')
  async readChannelMessages(
    @ConnectedSocket() Client: Socket,
    @MessageBody()
    data: {
      token: string;
      channelId: string;
    },
  ): Promise<number> {
    try {
      const user = await this.authService.getUserFromToken(data.token);
      if (!user) throw new ForbiddenException('user not loged in');
      const channel = await this.prisma.channels.findFirst({
        where: {
          id: data.channelId,
        },
      });
      if (!channel) throw new ForbiddenException('channel doesnt exist');
      const updatedMessages = (
        channel.messages as {
          sender: string;
          content: string;
          date: string;
          read: string[];
        }[]
      ).map((message) => {
        const updatedMessage = Object.assign({}, message);
        updatedMessage.read = message.read
          ? message.read.concat(user.id)
          : [user.id];
        return updatedMessage;
      });

      // Update the channel with the modified messages
      await this.prisma.channels.update({
        where: { id: data.channelId },
        data: { messages: { set: updatedMessages } },
      });

      return 1;
    } catch (error) {
      this.logger.debug('problem in readChannelMessages');
      return 0;
    }
  }
}

import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { channel } from 'diagnostics_channel';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Returns all users as an arraw
  async getUsers() {
    const all_users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatar: true,
        points: true,
        wins: true,
        losses: true,
        friends: true,
        channels: true,
        adminOf: true,
        bannedFrom: true,
        mutedOn: true,
      },
    });

    return all_users;
  }

  // Returns User Info
  getMe(user: any) {
    return user;
  }

  // Get user by username
  async getUserById(username: string) {
    const requested_user = await this.prisma.user.findFirst({
      where: {
        username,
      },
      include: {
        friends: true,
      },
    });

    return requested_user;
  }

  // Sends friend request
  async requestFriend(id: string, sender_info: any) {
    // Save friend
    const friend = await this.prisma.user.findUnique({
      where: { id },
      include: { friends: true, friendOf: true },
    });

    // Check if the friend exists. If it doesn't, throw.
    if (!friend) throw new ForbiddenException('User does not exist');

    // Check that sender != receiver. If same, throw.
    if (id == sender_info.sub)
      throw new ForbiddenException('Sender is same as Receiver');

    // Check that sender and receiver are not already friends. If they are, throw.
    const sender = await this.prisma.user.findUnique({
      where: { id: sender_info.sub },
      include: { friends: true, friendOf: true },
    });
    if (!sender) throw new ForbiddenException('Something went wrong');
    if (friend.friends.includes(friend))
      throw new ForbiddenException('Already Friends');

    // Check if the request was already sent (bilateral check)
    const already_sent = await this.prisma.connections.findFirst({
      where: {
        OR: [
          { creator: sender_info.sub, receiver: id },
          { creator: id, receiver: sender_info.sub },
        ],
      },
    });

    if (already_sent)
      throw new ForbiddenException('Friend Request already sent');

    // Add new connection to database
    const connection = await this.prisma.connections.create({
      data: {
        creator: sender_info.sub,
        receiver: id,
      },
    });
  }

  // Responds to friend request (accept or reject)
  async respondFriend(id: string, action: string, sender_info: any) {
    // Check if action is either 'accept' or 'reject'. If not, throw
    if (action != 'accept' && action != 'reject')
      throw new ForbiddenException(`Invalid Action: ${action}`);

    // Save target friend
    let friend = await this.prisma.user.findUnique({
      where: { id },
    });

    // Check if the friend exists. If it doesn't, throw.
    if (!friend) throw new ForbiddenException('User does not exist');

    // Check that sender != receiver. If same, throw.
    if (id == sender_info.sub)
      throw new ForbiddenException('Sender is same as Receiver');

    // Check that sender and receiver are not already friends. If they are, throw.
    let sender = await this.prisma.user.findUnique({
      where: { id: sender_info.sub },
      include: { friends: true, friendOf: true },
    });

    if (!sender) throw new ForbiddenException('Something went wrong');

    if (sender.friends.map((user) => user.id).includes(id))
      throw new ForbiddenException('Already Friends');

    // Check if request exists. If not, throw.
    const req_exists = await this.prisma.connections.findFirst({
      where: {
        creator: id,
        receiver: sender_info.sub,
      },
    });

    if (!req_exists)
      throw new ForbiddenException('Friend Request does not exist');

    if (action == 'accept') {
      // Add friendship to all.
      await this.prisma.user.update({
        where: { id: sender_info.sub },
        data: { friends: { connect: [{ id: id }] } },
      });

      await this.prisma.user.update({
        where: { id: id },
        data: { friends: { connect: [{ id: sender_info.sub }] } },
      });
    }

    // Remove connection from DB.
    await this.prisma.connections.deleteMany({
      where: {
        creator: id,
        receiver: sender_info.sub,
      },
    });
  }

  // Removes friend
  async removeFriend(id: string, sender_info: any) {
    // Save target friend
    let friend = await this.prisma.user.findUnique({
      where: { id },
    });

    // Check if the friend exists. If it doesn't, throw.
    if (!friend) throw new ForbiddenException('User does not exist');

    // Check that sender != receiver. If same, throw.
    if (id == sender_info.sub)
      throw new ForbiddenException('Sender is same as Receiver');

    // Check that sender and receiver are friends. If not, throw.
    let sender = await this.prisma.user.findUnique({
      where: { id: sender_info.sub },
      include: { friends: true, friendOf: true },
    });

    if (!sender) throw new ForbiddenException('Something went wrong');

    if (!sender.friends.map((user) => user.id).includes(id))
      throw new ForbiddenException('Not Friends');

    // Remove connection from DB.
    await this.prisma.user.update({
      where: { id: sender_info.sub },
      data: { friends: { disconnect: [{ id: id }] } },
    });
    await this.prisma.user.update({
      where: { id: id },
      data: { friends: { disconnect: [{ id: sender_info.sub }] } },
    });
  }

  // Returns all channels user is part of
  async getUserChannels(id: string) {
    // Get user from db
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        channels: {
          include: {
            members: true,
          },
        },
      },
    });

    const channels = user.channels.map((channel) => {
      return {
        ...channel,
        members: channel.members.map((member) => {
          return member.username;
        }),
      };
    });

    return channels;
  }

  // Returns all channels user is NOT part of
  async getNonUserChannels(id: string) {
    // Get the IDs of the channels the user is part of
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        channels: {
          include: {
            members: true,
          },
        },
      },
    });
    const included_channels = user.channels.map((channel) => channel.id);

    // Get all channels
    const all_channels = await this.prisma.channels.findMany({
      include: {
        members: true,
      },
    });

    // Build excluded channels
    const excluded_channels = all_channels
      .filter((channel) => !included_channels.includes(channel.id))
      .map((channel) => {
        return {
          ...channel,
          members: channel.members.map((member) => {
            return member.username;
          }),
        };
      });

    return excluded_channels;
  }

  async changeAvatar(user: any, newPath: string) {
    const oldAvatar: string = user.avatar;
    if (oldAvatar.indexOf('http://localhost:3000') === 0) {
      fs.unlink(
        oldAvatar.replace(
          'http://localhost:3000/',
          join(__dirname, '../..', 'public/'),
        ),
        (err) => {
          if (err instanceof Error) console.error(err);
        },
      );
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { avatar: newPath },
    });
  }
}

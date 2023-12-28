import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserById(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      include: {
        friends: true,
        friendOf: true,
        channels: true,
        adminOf: true,
        bannedFrom: true,
        mutedOn: true,
      },
    });

    if (user) return user;
    return undefined;
  }

  // Returns all users as an arraw
  async getUsers() {
    const all_users = await this.prisma.user.findMany({
      select: {
        username: true,
        wins: true,
        losses: true,
        points: true,
      },
    });

    return all_users;
  }

  // Returns User Info
  getMe(user: any) {
    return user;
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
}

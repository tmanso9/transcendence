import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { channel } from 'diagnostics_channel';
import * as fs from 'fs';
import { join } from 'path';

type Alert = {
  id: string;
  message: string;
  sender: string;
  action: boolean;
};

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
        friends: true,
        channels: true,
        adminOf: true,
        bannedFrom: true,
        mutedOn: true,
		gamestats: true
      },
    });

    return all_users;
  }

	// Returns gamestats of a specific player
	async getUserGamestats(username: string) {
		const user = await this.prisma.user.findFirst({
			where: {
				username: username
			},
			select: {
				gamestats: true,
				rank: true
			}
		});

		if (!user)
			throw new ForbiddenException(`User ${username} does not exist`);

		return {
			rank: user.rank,
			points: user.gamestats.points,
			wins: user.gamestats.wins,
			losses: user.gamestats.losses,
			streak: user.gamestats.streak,
			total_games: user.gamestats.wins + user.gamestats.losses,
			win_ratio: user.gamestats.wins / (user.gamestats.wins + user.gamestats.losses)
		}
	}

  async getUserAchievements(username: string) {
    const user = await this.prisma.user.findFirst({
			where: {
				username: username
			},
		});

    return user.achievements;
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
        		gamestats: true,
				alerts: true
			}
		});
		if (!requested_user)
			throw new ForbiddenException(`User ${username} does not exist`);

		const friends = requested_user.friends.map(friend => {
			return {
				username: friend.username,
				avatar: friend.avatar,
				id: friend.id
			}
		});

		return {
			username: requested_user.username,
			rank: requested_user.rank,
			status: requested_user.status,
			avatar: requested_user.avatar,
			id: requested_user.id,
			gamestats: requested_user.gamestats,
			friends,
		};
	}

  async getFriends(id: string) {
    const friend = await this.prisma.user
      .findUnique({
        where: { id },
        select: { friends: true },
      })
      .friends();
    return friend.map((friend) => friend.username);
  }

  async getPending() {
    const pending = await this.prisma.connections.findMany();
    const allPairs = [];

    await Promise.all(
      pending.map(async (val) => {
        const creator = (
          await this.prisma.user.findUnique({ where: { id: val.creator } })
        )
        const receiver = (
          await this.prisma.user.findUnique({ where: { id: val.receiver } })
        )
		if (!creator || !receiver) return
		const creatorUsername = creator.username;
		const receiverUsername = receiver.username;
        const pair = new Array();
        pair.push(creatorUsername);
        pair.push(receiverUsername);
        allPairs.push(pair);
      }),
    );
    return allPairs.reverse();
  }

  async dismissAlert(
    id: string,
  ) {

	await this.prisma.alert.delete({ where: { id } });

    return true;
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
    const friendIds = friend.friends.map((val) => val.id);
    if (friendIds.includes(sender.id))
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

	await this.prisma.alert.create({
		data: {
	      message: 'added you as friend',
		  sender: sender.username,
		  senderId: sender.id,
		  targetId: id,
		  action: true
		}
	})
}

  // Responds to friend request (accept or reject)
  async respondFriend(id: string, action: string, sender_info: any) {
    // Check if action is either 'accept' or 'reject'. If not, throw
    if (action != 'accept' && action != 'reject')
      throw new ForbiddenException(`Invalid Action: ${action}`);


    // Save target friend
    let friend = await this.prisma.user.findUnique({
      where: { id },
	  include: { alerts: true}
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

	  await this.prisma.alert.create({
      data: {
        sender: sender.username,
        senderId: sender.id,
        targetId: id,
        message:
          action === 'accept'
            ? 'accepted your friend request'
            : 'rejected your friend request',
        action: false,
      },
    });


	}
	
	// Removes friend
	async removeFriend(id: string, sender_info: any) {
	  // Save target friend
	  let friend = await this.prisma.user.findUnique({
		where: { id },
		include: { alerts: true}
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

	  const notifyResult = friend.alerts;

	  await this.prisma.alert.create({
      data: {
        sender: sender.username,
        senderId: sender.id,
        targetId: id,
        message: 'is no longer your friend',
		action: false
      },
    });

	}

	async gameRequest(id: string, sender_info: any){
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { friends: true, friendOf: true },
    });

    // Check if the user exists. If it doesn't, throw.
    if (!user) throw new ForbiddenException('User does not exist');

    // Check that sender != receiver. If same, throw.
    if (id == sender_info.sub)
      throw new ForbiddenException('Sender is same as Receiver');

    const sender = await this.prisma.user.findUnique({
      where: { id: sender_info.sub },
      include: { friends: true, friendOf: true },
    });
    if (!sender) throw new ForbiddenException('Something went wrong');

	//TODO: Check if request already sent
    //TODO: Add new connection to database

	const alert = await this.prisma.alert.create({
		data: {
	      message: 'invited you to a game',
		  sender: sender.username,
		  senderId: sender.id,
		  targetId: id,
		  action: true
		}
	})

	return alert.id
	}

	async gameReject(id: string, sender_info: any) {
    // Save target user
    let user = await this.prisma.user.findUnique({
      where: { id },
	  include: { alerts: true}
    });

    // Check if the user exists. If it doesn't, throw.
    if (!user) throw new ForbiddenException('User does not exist');

    // Check that sender != receiver. If same, throw.
    if (id == sender_info.sub)
      throw new ForbiddenException('Sender is same as Receiver');

    let sender = await this.prisma.user.findUnique({
      where: { id: sender_info.sub },
      include: { friends: true, friendOf: true },
    });

    if (!sender) throw new ForbiddenException('Something went wrong');

	  await this.prisma.alert.create({
      data: {
        sender: sender.username,
        senderId: sender.id,
        targetId: id,
        message: 'rejected your game request',
        action: false,
      },
    });
}

/* CHANGE USER DETAILS */
	async changeUsername(user: any, username: string) {
		this.validareUsername(username);
		const unique = await this.prisma.user.findUnique({where: {username: username}});

		if (unique)
			throw new ForbiddenException("Username already taken");

		const updated = await this.prisma.user.update({where: {email: user.email}, data: {username: username}})
		return updated;
	}

	async changePassword(user: any, password: string, oldPass: string) {
		this.validatePassword(password);
		const trueUser = await this.prisma.user.findUnique({where: {email: user.email}});
		if (trueUser.login !== "REGULAR")
			throw new ForbiddenException('This user can\'t change password');
		const verifyPass = await argon.verify(trueUser.password, oldPass);
		if (!verifyPass)
			throw new ForbiddenException('Wrong password');
		const hashed = await argon.hash(password); 
		const updated = await this.prisma.user.update({where: {email: user.email}, data: {password: hashed }})
		return updated;
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
    if (oldAvatar.indexOf(`${process.env.HOST}:${process.env.BE_PORT}`) === 0) {
      fs.unlink(
        oldAvatar.replace(
          `${process.env.HOST}:${process.env.BE_PORT}`,
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
  
	validatePassword(pass: string) {
		if (pass.length < 8 || pass === pass.toLowerCase() || pass === pass.toUpperCase() || !/\d/.test(pass))
			throw new ForbiddenException('Password must contain at least 8 characters, 1 Uppercase, 1 Lowercase and 1 digit');
	}

	validareUsername(username: string) {
		if (username.length <= 4 || !/^[a-zA-Z0-9_-]+$/.test(username))
			throw new ForbiddenException('Username must be at least 5 characters long and can only have alphanumeric characters or -/_');
	}
}

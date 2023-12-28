import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddToChannelDTO, CreateChannelDTO } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ChannelsService {
	constructor(private prisma: PrismaService) {}
	
	async getChannels() {
		const channels = await this.prisma.channels.findMany();
		return channels;
	}

	async createChannel(dto: CreateChannelDTO, id: string) {
		// Create Channel
		const new_channel = await this.prisma.channels.create({
			data: {
				creator: dto.creator,
				channelName: dto.channelName,
				password: dto.password,
				type: dto.channelType,
				members: {
					connect: { id }
				},
				admins: {
					connect: { id }
				}
			}
		})

		delete new_channel.password;

		return new_channel;
	}

	async addUserToChannel(dto: AddToChannelDTO, id: string) {
		try {
			// Check if the channel exists, and if the user is an admin
			await this.userIsAdmin(id, dto.channel_id);
			// If the channel is private, don't add users
			const channel = await this.prisma.channels.findUnique({
				where: {
					id: dto.channel_id
				},
				include: {
					members: true
				}
			});
			if (channel.type === 'PERSONAL' && channel.members.length === 2)
				throw new ForbiddenException(`Can't add more users to private channel`);
			// Add user to the channel
			await this.prisma.channels.update({
				where: {
					id: dto.channel_id
				},
				data: {
					members: {
						connect: {
							username: dto.user
						}
					}
				}
			});
		} catch(error) {
			if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025')
				throw new ForbiddenException('User does not exist');
			throw error;
		}
	}

	async removeUserFromChannel(dto: AddToChannelDTO, id: string) {
		try {
			// Check if the channel exists, and if the user is an admin
			await this.userIsAdmin(id, dto.channel_id);
			// Add user to the channel
			await this.prisma.channels.update({
				where: {
					id: dto.channel_id
				},
				data: {
					members: {
						disconnect: {
							username: dto.user
						}
					},
					admins: {
						disconnect: {
							username: dto.user
						}
					}
				}
			});
		} catch(error) {
			if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025')
				throw new ForbiddenException('User does not exist');
			throw error;
		}
	}

	async addAdminToChannel(dto: AddToChannelDTO, id: string) {
		try {
			// Check if the channel exists, and if the user is an admin
			await this.userIsAdmin(id, dto.channel_id);
			// Add admin to the channel
			await this.prisma.channels.update({
				where: {
					id: dto.channel_id
				},
				data: {
					admins: {
						connect: {
							username: dto.user
						}
					}
				}
			});
		} catch(error) {
			if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025')
				throw new ForbiddenException('User does not exist');
			throw error;
		}
	}

	private async userIsAdmin(user_id: string, channel_id: string) {
		const channel = await this.prisma.channels.findUnique({
			where: {
				id: channel_id
			},
			include: {
				admins: true
			}
		});
		if (!channel)
			throw new ForbiddenException('Channel does not exist');

		if (!channel.admins.map(admin => admin.id).includes(user_id))
			throw new ForbiddenException('User is not an admin');
	}
}

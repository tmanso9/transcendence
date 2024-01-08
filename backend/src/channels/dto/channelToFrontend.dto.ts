import { User } from '@prisma/client';
import { IsNotEmpty, IsString, Validate } from 'class-validator';

export class ChannelToFrontendDTO {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  creator: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  channelName: string;

  members: User[];

  messages: { sender: String; content: String; date: String }[];

  admins: User[];

  bannedUsers: User[];

  mutedUsers: User[];
}

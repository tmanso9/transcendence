import { User } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

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

  messages: { sender: string; content: string; date: string }[];

  admins: User[];

  bannedUsers: User[];

  mutedUsers: User[];
}

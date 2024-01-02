import { User } from "./user";

export interface Channel {
  id: string;
  creator: string;
  type: string;
  password?: string;
  channelName?: string;
  avatar: string;
  members?: User[];
  messages: { sender: string; content: string; date: string }[];
  admins?: User[];
  bannedUsers?: User[];
  mutedUsers?: User[];
}

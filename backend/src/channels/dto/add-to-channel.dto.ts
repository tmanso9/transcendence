import { IsNotEmpty, IsString } from 'class-validator';

export class AddToChannelDTO {
  @IsString()
  @IsNotEmpty()
  channel_id: string;

  @IsString()
  @IsNotEmpty()
  user: string;
}

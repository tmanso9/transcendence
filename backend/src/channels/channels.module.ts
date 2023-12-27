import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsGateway } from './channels.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [AuthModule, UserService],
  providers: [ChannelsGateway, ChannelsService],
})
export class ChannelsModule {}

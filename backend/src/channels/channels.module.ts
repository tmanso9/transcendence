import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsGateway } from './channels.gateway';
import { ChannelsController } from './channels.controller';

@Module({
  providers: [ChannelsGateway, ChannelsService],
  controllers: [ChannelsController],
})
export class ChannelsModule {}

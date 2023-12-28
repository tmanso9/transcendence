import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { JwtGuard } from 'src/auth/guards';
import { AddToChannelDTO, CreateChannelDTO } from './dto';
import { decodeJwt } from 'src/user/decorator';

@UseGuards(JwtGuard)
@Controller('channels')
export class ChannelsController {
	constructor(private channelsService: ChannelsService) {}

	@Get()
	getChannels() {
		return this.channelsService.getChannels();
	}

	@Post('create')
	createChannel(@Body() dto: CreateChannelDTO, @decodeJwt('sub') id: string) {
		return this.channelsService.createChannel(dto, id);
	}

	@Post('add-user')
	addUserToChannel(@Body() dto: AddToChannelDTO, @decodeJwt('sub') id: string) {
		return this.channelsService.addUserToChannel(dto, id);
	}

	@Post('remove-user')
	removeUserFromChannel(@Body() dto: AddToChannelDTO, @decodeJwt('sub') id: string) {
		return this.channelsService.removeUserFromChannel(dto, id);
	}

	@Post('add-admin')
	addAdminToChannel(@Body() dto: AddToChannelDTO, @decodeJwt('sub') id: string) {
		return this.channelsService.addAdminToChannel(dto, id);
	}
}

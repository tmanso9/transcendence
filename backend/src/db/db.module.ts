import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DbService } from './db.service';
import { DbController } from './db.controller';

@Module({
	imports: [
		HttpModule,
	],
	providers: [DbService],
	controllers: [DbController],
})
export class DbModule {}

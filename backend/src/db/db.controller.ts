import { Controller, Get, Param } from '@nestjs/common';
import { DbService } from './db.service';

@Controller('db')
export class DbController {
	constructor(private dbService: DbService) {}

	@Get('populate/:n')
	async populate(@Param('n') num: number) {
		return this.dbService.populate(num);
	}
}

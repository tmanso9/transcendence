import { Body, Controller, ForbiddenException, Get, Param, Post } from "@nestjs/common";
import { GameBackendService } from "./gameBackend.service";
import { GameDTO } from "./dto";

@Controller('game-backend')
export class GameBackendController {
	constructor(private gameService: GameBackendService) {}

	@Post('create')
	createGame(@Body() dto: GameDTO) {
		dto.loserScore = parseInt(dto.loserScore);
		if (isNaN(dto.loserScore))
			throw new ForbiddenException('Invalid loserScore');
		return this.gameService.createGame(dto);
	}

	@Get('games/:id')
	getUserGames(@Param('id') id: any){
		return this.gameService.getUserGames(id);
	}
}

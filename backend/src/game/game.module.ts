import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { gameGateway } from './game.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [],
  controllers: [GameController],
  providers: [GameService, gameGateway, JwtService],
  exports: [GameService],
})
export class GameModule {}

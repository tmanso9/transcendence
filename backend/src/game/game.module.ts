import { Module } from '@nestjs/common';
import {GameController} from "./game.controller";
import {GameService} from "./game.service";
import {gameGateway} from "./game.gateway";

@Module({
    imports: [],
    controllers: [GameController],
    providers: [GameService, gameGateway],
    exports: [GameService]
})
export class GameModule {}
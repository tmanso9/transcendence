import { Module } from '@nestjs/common';
import { GameBackendService } from './gameBackend.service';
import { GameBackendController } from './gameBackend.controller';

@Module({
  providers: [GameBackendService],
  controllers: [GameBackendController],
  exports: [GameBackendService],
})
export class GameBackendModule {}

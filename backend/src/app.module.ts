import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {appGateway} from "./app.gateway";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, appGateway],
})
export class AppModule {}

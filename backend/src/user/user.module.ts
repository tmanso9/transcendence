import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationsGateway, UserGateway } from './user.gateway';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtService, NotificationsGateway, UserGateway],
  exports: [UserService],
})
export class UserModule {}

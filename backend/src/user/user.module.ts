import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { LogoutMiddleware } from 'src/auth/middleware';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtService]
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LogoutMiddleware)
      .forRoutes('users/me');
  }
}

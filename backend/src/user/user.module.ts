import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { LogoutMiddleware } from 'src/auth/middleware';

@Module({
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LogoutMiddleware)
      .forRoutes('users/me');
  }
}

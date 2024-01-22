import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { DbModule } from './db/db.module';
import { ChannelsModule } from './channels/channels.module';
import { GameBackendModule } from './gameBackend/gameBackend.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UserModule,
    DbModule,
    ChannelsModule,
    GameBackendModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    DbModule,
    GameModule,
    ChannelsModule,
  ],
})
export class AppModule {}

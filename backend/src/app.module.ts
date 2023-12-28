import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { DbController } from './db/db.controller';
import { DbService } from './db/db.service';
import { DbModule } from './db/db.module';
import { GameModule } from './game/game.module';
import { ChannelsModule } from './channels/channels.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UserModule,
    DbModule,
    ChannelsModule,
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

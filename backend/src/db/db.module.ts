import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DbService } from './db.service';
import { DbController } from './db.controller';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [HttpModule],
  providers: [DbService, AuthService, JwtService],
  controllers: [DbController],
})
export class DbModule {}

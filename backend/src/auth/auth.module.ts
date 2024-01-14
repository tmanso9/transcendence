import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy, JwtStrategy, Strategy42 } from './strategy';

@Module({
	imports: [
		HttpModule,
		JwtModule.register({}),
	],
	providers: [AuthService, JwtStrategy, GoogleStrategy, Strategy42],
	controllers: [AuthController],
	exports: [AuthService]
})
export class AuthModule {}

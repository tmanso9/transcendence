import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { HttpModule } from "@nestjs/axios";
import { JwtModule } from "@nestjs/jwt";
import { GoogleStrategy, JwtStrategy } from "./strategy";

@Module({
	imports: [
		HttpModule,
		JwtModule.register({}),
	],
	providers: [AuthService, JwtStrategy, GoogleStrategy],
	controllers: [AuthController],
})
export class AuthModule {}

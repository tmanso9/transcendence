import { Injectable, NestMiddleware, ForbiddenException, Res, Req } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { NextFunction, Request, Response } from "express";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ValidationMiddleware implements NestMiddleware {
    constructor(private prisma: PrismaService, private jwt: JwtService) {}
    
    async use(@Req() req: Request, @Res({passthrough: true}) res: Response, next: NextFunction) {
        
        // Verify if access token is not blacklisted
        const tokenBlacklisted = await this.prisma.blacklist.findUnique({where: {token: req.cookies['access_token']}});
        if (tokenBlacklisted)
            throw new ForbiddenException('Invalid access token');
    
        // Verify if user is not blocked
        const tokenDecoded = await this.jwt.decode(req.cookies['access_token']);
        const user = await this.prisma.user.findUnique({where: {email: tokenDecoded.email}});
        if (user.status === "BLOCKED")
            throw new ForbiddenException('Account blocked for safety reasons');

        next();
    }
}

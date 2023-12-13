import { Injectable, NestMiddleware, ForbiddenException, Res, Req } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class LogoutMiddleware implements NestMiddleware {
    constructor(private prisma: PrismaService) {}
    
    async use(@Req() req: Request, @Res({passthrough: true}) res: Response, next: NextFunction) {
        const token = await this.prisma.blacklist.findUnique({where: {token: req.cookies['access_token']}});
        if (token)
            throw new ForbiddenException('Invalid access token');
        next();
    }
}

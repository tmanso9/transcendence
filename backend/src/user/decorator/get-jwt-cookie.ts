import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const decodeJwt = createParamDecorator(
  async (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const jwt = new JwtService();
    const token = request.cookies?.['access_token'];
    const decoded = await jwt.decode(token);
    if (data) return decoded[data];
    return decoded;
  },
);

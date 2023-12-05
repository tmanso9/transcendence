import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const getJWT = createParamDecorator((data: any, ctx: ExecutionContext) => {
	const request = ctx
		.switchToHttp()
		.getRequest();

	return request.cookies?.['access_token'];
})
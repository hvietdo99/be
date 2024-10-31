import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAccessTokenAuth } from '@common/guards/auth.guard';

export const Auth = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IAccessTokenAuth => {
    const request = ctx.switchToHttp().getRequest();
    return request?.auth || {};
  },
);

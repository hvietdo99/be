import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppConstants } from '@common/constants/app.constants';
import { Lang } from '@common/classes/response.dto';

export const Language = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request?.headers[AppConstants.LANG_HEADERS_KEY] || Lang.EN;
  },
);

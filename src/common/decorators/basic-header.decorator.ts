import {
  applyDecorators,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConsumes,
  ApiHeader,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AppConstants } from '@common/constants/app.constants';
import { ErrorDto } from '@common/classes/error.dto';

export function BasicHeader(tag: string) {
  return applyDecorators(
    ApiHeader({
      name: AppConstants.LANG_HEADERS_KEY,
      required: true,
    }),
    ApiTags(tag),
    ApiConsumes('application/json'),
    ApiBadRequestResponse({
      description: 'Bad request',
      type: ErrorDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      type: ErrorDto,
    }),
    UseInterceptors(ClassSerializerInterceptor),
  );
}

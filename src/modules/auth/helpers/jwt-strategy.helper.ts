import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@modules/database/schemas/user.schema';
import { GenerateTokenDto } from '@modules/auth/dto/register.dto';
import * as _ from 'lodash';
import { Config } from '@config/config';
import { IRefreshTokenAuth, IRefreshTokenPayload } from '@common/guards/auth.guard';
import { Lang } from '@common/classes/response.dto';
import { ErrorCode } from '@common/constants/error.constants';
import { getErrorMessage } from '@common/utils/utils';
import { SettingDocument } from '@modules/database/schemas/setting.schema';
import { GetSettingResponseDto } from '@modules/customer/setting/dto/get-setting.dto';

@Injectable()
export class JwtStrategyHelper {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(
    user: User,
    setting: SettingDocument | GetSettingResponseDto,
  ): GenerateTokenDto {
    const accessToken = this.jwtService.sign(
      {
        user: _.pick(user, ['_id', 'address', 'name', 'avatar', 'role', 'type']),
        setting: _.pick(setting, ['currency', 'lang', 'verification']),
      },
      {
        secret: Config.JWT_SECRET,
        expiresIn: Config.ACCESS_TOKEN_EXPIRED_TIME,
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        user: _.pick(user, ['_id']),
      },
      {
        secret: Config.JWT_SECRET,
        expiresIn: Config.REFRESH_TOKEN_EXPIRED_TIME,
      },
    );

    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(lang: Lang, token: string): Promise<IRefreshTokenAuth> {
    const payload: IRefreshTokenPayload = await this.jwtService.verifyAsync(token, {
      secret: Config.JWT_SECRET,
    });

    const now = Date.now();
    if (payload.exp * 1000 <= now) {
      throw new BadRequestException(getErrorMessage(ErrorCode.TOKEN_EXPIRED, lang));
    }

    if (!payload?.user?._id) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.INVALID_REFRESH_TOKEN, lang),
      );
    }

    return payload.user;
  }
}

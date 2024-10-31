import { BasicHeader } from '@common/decorators/basic-header.decorator';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { SettingService } from '@modules/customer/setting/setting.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AuthGuard, IAccessTokenAuth } from '@common/guards/auth.guard';
import { Auth } from '@common/decorators/auth.decorator';
import { ApiResponseDto, Lang } from '@common/classes/response.dto';
import { Language } from '@common/decorators/lang.decorator';
import { GetSettingResponseDto } from '@modules/customer/setting/dto/get-setting.dto';
import { ApiMessageKey } from '@common/constants/message.constants';
import { UpdateSettingDto } from '@modules/customer/setting/dto/update-setting.dto';

@BasicHeader('Setting')
@Controller('customer/setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  @ApiOperation({
    summary: 'Get setting',
    description: 'Get setting',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<GetSettingResponseDto> })
  async get(
    @Language() lang: Lang,
    @Auth() auth: IAccessTokenAuth,
  ): Promise<ApiResponseDto<GetSettingResponseDto>> {
    try {
      const data = await this.settingService.get(auth._id);
      return new ApiResponseDto<GetSettingResponseDto>({
        statusCode: HttpStatus.OK,
        data,
        pagination: null,
        message: ApiMessageKey.GET_SETTING_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update setting',
    description: 'Update setting',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<GetSettingResponseDto> })
  async update(
    @Language() lang: Lang,
    @Auth() auth: IAccessTokenAuth,
    @Param('id') id: string,
    @Body() body: UpdateSettingDto,
  ): Promise<ApiResponseDto<GetSettingResponseDto>> {
    try {
      const data = await this.settingService.update(lang, id, auth._id, body);
      return new ApiResponseDto<GetSettingResponseDto>({
        statusCode: HttpStatus.OK,
        data,
        pagination: null,
        message: ApiMessageKey.UPDATE_SETTING_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }
}

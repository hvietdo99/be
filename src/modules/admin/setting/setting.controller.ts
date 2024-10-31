import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicHeader } from '@common/decorators/basic-header.decorator';
import { SettingService } from '@modules/admin/setting/setting.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@common/guards/auth.guard';
import { ApiResponseDto, Lang } from '@common/classes/response.dto';
import { Language } from '@common/decorators/lang.decorator';
import { ApiMessageKey } from '@common/constants/message.constants';
import {
  GetAllVolumeSettingDto,
  GetAllVolumeSettingResponseDto,
} from '@modules/admin/setting/dto/get-all-volume-setting.dto';
import { RoleGuard } from '@common/guards/role.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@modules/database/schemas/user.schema';
import { CreateVolumeSettingDto } from '@modules/admin/setting/dto/create-volume-setting.dto';
import { UpdateVolumeSettingDto } from '@modules/admin/setting/dto/update-volume-setting.dto';

@BasicHeader('Setting')
@Controller('admin/setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get('volume')
  @ApiOperation({
    summary: 'Get volume setting',
    description: 'Get volume setting',
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles([UserRole.SU, UserRole.ADMIN])
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<GetAllVolumeSettingResponseDto> })
  async getAllVolumeSetting(
    @Language() lang: Lang,
    @Query() query: GetAllVolumeSettingDto,
  ): Promise<ApiResponseDto<GetAllVolumeSettingResponseDto>> {
    try {
      const { data, pagination } =
        await this.settingService.getAllVolumeSetting(query);
      return new ApiResponseDto<GetAllVolumeSettingResponseDto>({
        statusCode: HttpStatus.OK,
        data,
        pagination,
        message: ApiMessageKey.GET_ALL_VOLUME_SETTING_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Post('volume')
  @ApiOperation({
    summary: 'Create volume setting',
    description: 'Create volume setting',
  })
  @Roles([UserRole.SU, UserRole.ADMIN])
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async createVolumeSetting(
    @Language() lang: Lang,
    @Body() body: CreateVolumeSettingDto,
  ) {
    try {
      const data = await this.settingService.createVolumeSetting(lang, body);

      return new ApiResponseDto<boolean>({
        statusCode: HttpStatus.OK,
        data,
        message: ApiMessageKey.CREATE_VOLUME_SETTING_SUCCESS,
        pagination: null,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Patch('volume/:id')
  @ApiOperation({
    summary: 'Update volume setting',
    description: 'Update volume setting',
  })
  @Roles([UserRole.SU, UserRole.ADMIN])
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async updateVolumeSetting(
    @Language() lang: Lang,
    @Param('id') id: string,
    @Body() body: UpdateVolumeSettingDto,
  ) {
    try {
      const data = await this.settingService.updateVolumeSetting(lang, id, body);

      return new ApiResponseDto<boolean>({
        statusCode: HttpStatus.OK,
        data,
        message: ApiMessageKey.UPDATE_VOLUME_SETTING_SUCCESS,
        pagination: null,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Delete('volume/:id')
  @ApiOperation({
    summary: 'Delete volume setting',
    description: 'Delete volume setting',
  })
  @Roles([UserRole.SU, UserRole.ADMIN])
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async deleteVolumeSetting(@Language() lang: Lang, @Param('id') id: string) {
    try {
      const data = await this.settingService.deleteVolumeSetting(lang, id);

      return new ApiResponseDto<boolean>({
        statusCode: HttpStatus.OK,
        data,
        message: ApiMessageKey.DELETE_VOLUME_SETTING_SUCCESS,
        pagination: null,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }
}

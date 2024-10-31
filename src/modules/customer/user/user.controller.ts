import { Body, Controller, Get, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { BasicHeader } from '@common/decorators/basic-header.decorator';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AuthGuard, IAccessTokenAuth } from '@common/guards/auth.guard';
import { GetProfileResponseDto } from '@modules/customer/user/dto/get-profile.dto';
import { ApiResponseDto, Lang } from '@common/classes/response.dto';
import { Language } from '@common/decorators/lang.decorator';
import { Auth } from '@common/decorators/auth.decorator';
import { ApiMessageKey } from '@common/constants/message.constants';
import { CreateUserResponseDto } from '@modules/admin/user/dto/create-user.dto';
import { CreateUserDto } from '@modules/customer/user/dto/create-user.dto';
import { CreatePasswordDto } from '@modules/customer/user/dto/create-password.dto';

@BasicHeader('User')
@Controller('customer/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({
    summary: 'Get profile',
    description: 'Get profile',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<GetProfileResponseDto> })
  async getProfile(
    @Language() lang: Lang,
    @Auth() auth: IAccessTokenAuth,
  ): Promise<ApiResponseDto<GetProfileResponseDto>> {
    try {
      const data = await this.userService.getProfile(auth._id);

      return new ApiResponseDto<GetProfileResponseDto>({
        statusCode: HttpStatus.OK,
        data,
        pagination: null,
        message: ApiMessageKey.GET_USER_DETAIL_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Create user',
    description: 'Create user',
  })
  @ApiOkResponse({ type: ApiResponseDto<CreateUserResponseDto> })
  async create(@Language() lang: Lang, @Body() body: CreateUserDto) {
    try {
      const data = await this.userService.create(lang, body);

      return new ApiResponseDto<CreateUserResponseDto>({
        statusCode: HttpStatus.OK,
        data,
        message: ApiMessageKey.CREATE_USER_SUCCESS,
        pagination: null,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Post('password')
  @ApiOperation({
    summary: 'Create password',
    description: 'Create password',
  })
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async createPassword(@Language() lang: Lang, @Body() body: CreatePasswordDto) {
    try {
      const data = await this.userService.createPassword(lang, body);

      return new ApiResponseDto<boolean>({
        statusCode: HttpStatus.OK,
        data,
        message: ApiMessageKey.CREATE_PASSWORD_SUCCESS,
        pagination: null,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }
}

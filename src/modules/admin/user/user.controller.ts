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
import { UserService } from '@modules/admin/user/user.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@common/guards/auth.guard';
import { ApiResponseDto, Lang } from '@common/classes/response.dto';
import {
  GetAllUsersDto,
  GetAllUsersResponseDto,
} from '@modules/admin/user/dto/get-all-user.dto';
import { ApiMessageKey } from '@common/constants/message.constants';
import { Language } from '@common/decorators/lang.decorator';
import { RoleGuard } from '@common/guards/role.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@modules/database/schemas/user.schema';
import { GetUserDetailResponseDto } from '@modules/admin/user/dto/get-user-detail.dto';
import {
  UpdateUserDto,
  UpdateUserResponseDto,
} from '@modules/admin/user/dto/update-user.dto';
import {
  CreateUserDto,
  CreateUserResponseDto,
} from '@modules/admin/user/dto/create-user.dto';

@BasicHeader('User')
@Controller('admin/user')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({
    summary: 'Get list users',
    description: 'Get list users',
  })
  @Roles([UserRole.SU, UserRole.ADMIN])
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<GetAllUsersResponseDto[]> })
  async findAll(@Language() lang: Lang, @Query() query: GetAllUsersDto) {
    try {
      const { data, pagination } = await this.userService.findAll(query);
      return new ApiResponseDto<GetAllUsersResponseDto[]>({
        statusCode: HttpStatus.OK,
        data,
        message: ApiMessageKey.GET_ALL_USERS_SUCCESS,
        pagination,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user detail',
    description: 'Get user detail',
  })
  @Roles([UserRole.SU, UserRole.ADMIN])
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<GetUserDetailResponseDto> })
  async findOne(@Language() lang: Lang, @Param('id') id: string) {
    try {
      const data = await this.userService.findOne(id);

      return new ApiResponseDto<GetUserDetailResponseDto>({
        statusCode: HttpStatus.OK,
        data,
        message: ApiMessageKey.GET_USER_DETAIL_SUCCESS,
        pagination: null,
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
  @Roles([UserRole.SU, UserRole.ADMIN])
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
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

  @Post('/wallet')
  @ApiOperation({
    summary: 'Create Master Wallet',
    description: 'Create Master Wallet',
  })
  @Roles([UserRole.SU, UserRole.ADMIN])
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<CreateUserResponseDto> })
  async generateMasterWallet() {
    return await this.userService.generateMasterWallet();
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user',
  })
  @Roles([UserRole.SU, UserRole.ADMIN])
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<UpdateUserResponseDto> })
  async update(
    @Language() lang: Lang,
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ) {
    try {
      const data = await this.userService.update(id, lang, body);

      return new ApiResponseDto<UpdateUserResponseDto>({
        statusCode: HttpStatus.OK,
        data,
        message: ApiMessageKey.UPDATE_USER_SUCCESS,
        pagination: null,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete user',
  })
  @Roles([UserRole.SU, UserRole.ADMIN])
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async delete(@Language() lang: Lang, @Param('id') id: string) {
    try {
      const data = await this.userService.delete(id, lang);

      return new ApiResponseDto<boolean>({
        statusCode: HttpStatus.OK,
        data,
        message: ApiMessageKey.DELETE_USER_SUCCESS,
        pagination: null,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }
}

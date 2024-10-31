import { BasicHeader } from '@common/decorators/basic-header.decorator';
import { Body, Controller, Get, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '@modules/auth/auth.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiResponseDto, Lang } from '@common/classes/response.dto';
import { RegisterDto, RegisterResponseDto } from '@modules/auth/dto/register.dto';
import { ApiMessageKey } from '@common/constants/message.constants';
import { LoginDto, LoginResponseDto } from '@modules/auth/dto/login.dto';
import { Language } from '@common/decorators/lang.decorator';
import { ChangePasswordDto } from '@modules/auth/dto/change-password.dto';
import { Auth } from '@common/decorators/auth.decorator';
import { AuthGuard, IAccessTokenAuth } from '@common/guards/auth.guard';
import { ForgotPasswordDto } from '@modules/auth/dto/forgot-password.dto';
import {
  RefreshTokenDto,
  RefreshTokenResponseDto,
} from '@modules/auth/dto/refresh-token.dto';
import { RoleGuard } from '@common/guards/role.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@modules/database/schemas/user.schema';
import {
  CreateAdminDto,
  CreateAdminResponseDto,
} from '@modules/auth/dto/create-admin.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';

@BasicHeader('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register',
    description: 'Register',
  })
  @ApiOkResponse({ type: ApiResponseDto<RegisterResponseDto> })
  async register(@Language() lang: Lang, @Body() body: RegisterDto) {
    try {
      const data = await this.authService.register(lang, body);

      return new ApiResponseDto<RegisterResponseDto>({
        statusCode: HttpStatus.OK,
        data,
        message: ApiMessageKey.REGISTER_SUCCESS,
        pagination: null,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login',
    description: 'Login',
  })
  @ApiOkResponse({ type: ApiResponseDto<LoginResponseDto> })
  async login(
    @Language() lang: Lang,
    @Body() body: LoginDto,
  ): Promise<ApiResponseDto<LoginResponseDto>> {
    try {
      const data = await this.authService.login(lang, body);

      return new ApiResponseDto<LoginResponseDto>({
        statusCode: HttpStatus.OK,
        data,
        message: ApiMessageKey.LOGIN_SUCCESS,
        pagination: null,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Post('token/refresh')
  @ApiOperation({
    summary: 'Refresh token',
    description: 'Refresh token',
  })
  @ApiOkResponse({ type: ApiResponseDto<RefreshTokenResponseDto> })
  async refreshToken(
    @Language() lang: Lang,
    @Body() body: RefreshTokenDto,
  ): Promise<ApiResponseDto<RefreshTokenResponseDto>> {
    try {
      const data = await this.authService.refreshToken(lang, body);

      return new ApiResponseDto<RefreshTokenResponseDto>({
        statusCode: HttpStatus.OK,
        data,
        message: ApiMessageKey.REFRESH_TOKEN_SUCCESS,
        pagination: null,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Post('password/change')
  @ApiOperation({
    summary: 'Change password',
    description: 'Change password',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async changePassword(
    @Auth() auth: IAccessTokenAuth,
    @Language() lang: Lang,
    @Body() body: ChangePasswordDto,
  ): Promise<ApiResponseDto<boolean>> {
    try {
      const data = await this.authService.changePassword(auth._id, body);

      return new ApiResponseDto<boolean>({
        statusCode: HttpStatus.OK,
        data,
        message: ApiMessageKey.CHANGE_PASSWORD_SUCCESS,
        pagination: null,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Reset to default password
   * @todo: Integrate a validation service to validate email and update password
   */
  @Post('password/forgot')
  @ApiOperation({
    summary: 'Forgot password',
    description: 'Forgot password',
  })
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async forgotPassword(
    @Language() lang: Lang,
    @Body() body: ForgotPasswordDto,
  ): Promise<ApiResponseDto<boolean>> {
    try {
      const data = await this.authService.forgotPassword(lang, body);

      return new ApiResponseDto<boolean>({
        statusCode: HttpStatus.OK,
        data,
        message: ApiMessageKey.FORGOT_PASSWORD_SUCCESS,
        pagination: null,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Post('admin')
  @ApiOperation({
    summary: 'Create admin user - Only SU',
    description: 'Create admin user - Only SU',
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles([UserRole.SU])
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<CreateAdminResponseDto> })
  async createAdmin(
    @Language() lang: Lang,
    @Body() body: CreateAdminDto,
  ): Promise<ApiResponseDto<CreateAdminResponseDto>> {
    try {
      const data = await this.authService.createAdmin(lang, body);

      return new ApiResponseDto<CreateAdminResponseDto>({
        statusCode: HttpStatus.OK,
        data,
        message: ApiMessageKey.CREATE_ADMIN_SUCCESS,
        pagination: null,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Get('2fa')
  @ApiOperation({
    summary: 'Get 2FA',
    description: 'Get 2FA',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: ApiResponseDto<{
      otpauthURL: string;
      secret: string;
    } | null>,
  })
  async get2FA(@Language() lang: Lang, @Auth() auth: IAccessTokenAuth) {
    try {
      const data = await this.authService.get2FA(auth._id);

      return new ApiResponseDto<{
        otpauthURL: string;
        secret: string;
      } | null>({
        statusCode: HttpStatus.OK,
        data,
        message: ApiMessageKey.GET_2FA_SUCCESS,
        pagination: null,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Post('verify-2fa')
  @ApiOperation({
    summary: 'Verify 2fa',
    description: 'Verify 2fa',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async verify2FA(
    @Auth() auth: IAccessTokenAuth,
    @Language() lang: Lang,
    @Body() body: Verify2FADto,
  ): Promise<ApiResponseDto<boolean>> {
    try {
      const data = await this.authService.verify2FA(body.code, auth._id);

      return new ApiResponseDto<boolean>({
        statusCode: HttpStatus.OK,
        data,
        message: ApiMessageKey.VERIFY_2FA_SUCCESS,
        pagination: null,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Post('disable-2fa')
  @ApiOperation({
    summary: 'disable 2fa',
    description: 'disable 2fa',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async disable2FA(
    @Auth() auth: IAccessTokenAuth,
    @Language() lang: Lang,
    @Body() body: Verify2FADto,
  ): Promise<ApiResponseDto<boolean>> {
    try {
      const data = await this.authService.disable2FA(body.code, auth._id);

      return new ApiResponseDto<boolean>({
        statusCode: HttpStatus.OK,
        data,
        message: ApiMessageKey.DISABLE_2FA_SUCCESS,
        pagination: null,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }
}

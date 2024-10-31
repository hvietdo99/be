import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BasicHeader } from '@common/decorators/basic-header.decorator';
import { WalletService } from '@modules/admin/wallet/wallet.service';
import { ApiResponseDto, Lang } from '@common/classes/response.dto';
import { ApiMessageKey } from '@common/constants/message.constants';
import { Language } from '@common/decorators/lang.decorator';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@modules/database/schemas/user.schema';
import { AuthGuard } from '@common/guards/auth.guard';
import { RoleGuard } from '@common/guards/role.guard';
import { FindMasterWalletResponseDto } from '@modules/admin/wallet/dto/find-master-wallet.dto';
import { CreateMasterWalletDto } from '@modules/admin/wallet/dto/create-master-wallet.dto';
import { UpdateMasterWalletBalanceDto } from '@modules/admin/wallet/dto/update-master-wallet-balance.dto';
import { UpdateMasterWalletDto } from '@modules/admin/wallet/dto/update-master-wallet.dto';

@BasicHeader('Wallet')
@Controller('admin/wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('master')
  @ApiOperation({
    summary: 'Find master wallet',
    description: 'Find master wallet',
  })
  @Roles([UserRole.SU, UserRole.ADMIN])
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<FindMasterWalletResponseDto> })
  async findMasterWallet(@Language() lang: Lang) {
    try {
      const data = await this.walletService.findMasterWallet();

      return new ApiResponseDto<FindMasterWalletResponseDto>({
        statusCode: HttpStatus.OK,
        data,
        pagination: null,
        message: ApiMessageKey.FIND_MASTER_WALLET_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Post('master')
  @ApiOperation({
    summary: 'Create master wallet',
    description: 'Create master wallet',
  })
  @Roles([UserRole.SU, UserRole.ADMIN])
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<FindMasterWalletResponseDto> })
  async createMasterWallet(
    @Language() lang: Lang,
    @Body() body: CreateMasterWalletDto,
  ) {
    try {
      const data = await this.walletService.createMasterWallet(lang, body);

      return new ApiResponseDto<FindMasterWalletResponseDto>({
        statusCode: HttpStatus.OK,
        data,
        pagination: null,
        message: ApiMessageKey.CREATE_MASTER_WALLET_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Patch('master/:id')
  @ApiOperation({
    summary: 'Update master wallet',
    description: 'Update master wallet',
  })
  @Roles([UserRole.SU, UserRole.ADMIN])
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async updateMasterWallet(
    @Language() lang: Lang,
    @Param('id') id: string,
    @Body() body: UpdateMasterWalletDto,
  ): Promise<ApiResponseDto<boolean>> {
    try {
      const data = await this.walletService.updateMasterWallet(lang, id, body);

      return new ApiResponseDto<boolean>({
        statusCode: HttpStatus.OK,
        data,
        pagination: null,
        message: ApiMessageKey.UPDATE_MASTER_WALLET_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Patch('master/balance')
  @ApiOperation({
    summary: 'Update master wallet balance',
    description: 'Update master wallet balance',
  })
  @Roles([UserRole.SU])
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async updateMasterWalletBalance(
    @Language() lang: Lang,
    @Body() body: UpdateMasterWalletBalanceDto,
  ) {
    try {
      const data = await this.walletService.updateMasterWalletBalance(lang, body);

      return new ApiResponseDto<boolean>({
        statusCode: HttpStatus.OK,
        data,
        pagination: null,
        message: ApiMessageKey.UPDATE_MASTER_WALLET_BALANCE_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Delete('master/:id')
  @ApiOperation({
    summary: 'Delete master wallet',
    description: 'Delete master wallet',
  })
  @Roles([UserRole.SU, UserRole.ADMIN])
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async deleteMasterWallet(
    @Language() lang: Lang,
    @Param('id') id: string,
  ): Promise<ApiResponseDto<boolean>> {
    try {
      const data = await this.walletService.deleteMasterWallet(lang, id);

      return new ApiResponseDto<boolean>({
        statusCode: HttpStatus.OK,
        data,
        pagination: null,
        message: ApiMessageKey.DELETE_MASTER_WALLET_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }
}

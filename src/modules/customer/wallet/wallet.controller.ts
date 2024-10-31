import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from '@modules/customer/wallet/wallet.service';
import { AuthGuard, IAccessTokenAuth } from '@common/guards/auth.guard';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiResponseDto, Lang } from '@common/classes/response.dto';
import { Auth } from '@common/decorators/auth.decorator';
import { Language } from '@common/decorators/lang.decorator';
import { ConnectWalletDto } from '@modules/customer/wallet/dto/connect-wallet.dto';
import { ApiMessageKey } from '@common/constants/message.constants';
import { BasicHeader } from '@common/decorators/basic-header.decorator';
import {
  GetAllWalletDto,
  GetAllWalletResponseDto,
} from '@modules/customer/wallet/dto/get-all-wallet.dto';

@BasicHeader('Wallet')
@Controller('customer/wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all wallet',
    description: 'Get all wallet',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<GetAllWalletResponseDto[]> })
  async getAll(
    @Language() lang: Lang,
    @Auth() auth: IAccessTokenAuth,
    @Query() query: GetAllWalletDto,
  ) {
    try {
      const { data, pagination } = await this.walletService.getAll(auth._id, query);

      return new ApiResponseDto<GetAllWalletResponseDto[]>({
        statusCode: HttpStatus.OK,
        data,
        pagination,
        message: ApiMessageKey.GET_ALL_WALLET_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Post('connect')
  @ApiOperation({
    summary: 'Connect wallet',
    description: 'Connect wallet',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async connect(
    @Auth() auth: IAccessTokenAuth,
    @Language() lang: Lang,
    @Body() body: ConnectWalletDto,
  ): Promise<ApiResponseDto<boolean>> {
    try {
      const data = await this.walletService.connect(lang, auth._id, body);
      return new ApiResponseDto<any>({
        statusCode: HttpStatus.OK,
        data,
        pagination: null,
        message: ApiMessageKey.CONNECT_WALLET_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }
}

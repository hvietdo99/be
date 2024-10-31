import { BasicHeader } from '@common/decorators/basic-header.decorator';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from '@modules/customer/transaction/transaction.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AuthGuard, IAccessTokenAuth } from '@common/guards/auth.guard';
import { ApiResponseDto, Lang } from '@common/classes/response.dto';
import { CreateTransactionDto } from '@modules/customer/transaction/dto/create-transaction.dto';
import { Language } from '@common/decorators/lang.decorator';
import { ApiMessageKey } from '@common/constants/message.constants';
import { Auth } from '@common/decorators/auth.decorator';
import {
  GetAllTransactionDto,
  GetAllTransactionResponseDto,
} from '@modules/customer/transaction/dto/get-all-transaction.dto';
import { UpdateTransactionStatusDto } from '@modules/customer/transaction/dto/update-transaction-status.dto';
import { AssetService } from '@modules/customer/asset/asset.service';
import { GetTransactionDetailResponseDto } from '@modules/customer/transaction/dto/get-transaction-detail.dto';
import { TransferDto } from './dto/transfer-dto.dto';
import { WithdrawOrderDto, WithdrawResponseDto } from './dto/create-order.dto';
import { FiatDepositDto } from './dto/fiat-deposit.dto';

@BasicHeader('Transaction')
@Controller('customer/transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly assetService: AssetService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all transactions',
    description: 'Get all transactions',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<GetAllTransactionResponseDto[]> })
  async getAll(
    @Language() lang: Lang,
    @Auth() auth: IAccessTokenAuth,
    @Query() query: GetAllTransactionDto,
  ) {
    try {
      const { data, pagination } = await this.transactionService.getAll(
        auth._id,
        query,
      );

      return new ApiResponseDto<GetAllTransactionResponseDto[]>({
        statusCode: HttpStatus.OK,
        data,
        pagination,
        message: ApiMessageKey.GET_ALL_TRANSACTION_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get transaction detail',
    description: 'Get transaction detail',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<GetTransactionDetailResponseDto> })
  async getOne(@Language() lang: Lang, @Param('id') id: string) {
    try {
      const data = await this.transactionService.getOne(id);

      return new ApiResponseDto<GetTransactionDetailResponseDto>({
        statusCode: HttpStatus.OK,
        data,
        pagination: null,
        message: ApiMessageKey.GET_TRANSACTION_DETAIL_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Create transaction',
    description: 'Create transaction',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async create(
    @Language() lang: Lang,
    @Body() body: CreateTransactionDto,
  ): Promise<ApiResponseDto<boolean>> {
    try {
      const data = await this.transactionService.create(lang, body);

      return new ApiResponseDto<boolean>({
        statusCode: HttpStatus.OK,
        data,
        pagination: null,
        message: ApiMessageKey.CREATE_TRANSACTION_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Post('transfer')
  @ApiOperation({
    summary: 'Create transfer transaction',
    description: 'Create transfer transaction',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async transfer(
    @Language() lang: Lang,
    @Auth() auth: IAccessTokenAuth,
    @Body() dto: TransferDto,
  ) {
    const user = auth._id;
    return this.transactionService.transfer(lang, dto, user);
  }

  @Post('withdraw')
  @ApiOperation({
    summary: 'Create withdraw transaction',
    description: 'Create withdraw transaction',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<WithdrawResponseDto> })
  async withdrawWeb3(
    @Language() lang: Lang,
    @Auth() auth: IAccessTokenAuth,
    @Body() dto: WithdrawOrderDto,
  ) {
    try {
      const data = await this.transactionService.withdrawWeb3(
        lang,
        auth._id,
        dto.network,
        dto.amount,
        dto.address,
        dto.twoFACode,
      );

      return new ApiResponseDto<WithdrawResponseDto>({
        statusCode: HttpStatus.OK,
        data,
        pagination: null,
        message: ApiMessageKey.WITHDRAW_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update transaction status',
    description: 'Update transaction status',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async updateTransactionStatus(
    @Auth() auth: IAccessTokenAuth,
    @Language() lang: Lang,
    @Param('id') id: string,
    @Body() { status }: UpdateTransactionStatusDto,
  ) {
    try {
      return new ApiResponseDto<boolean>({
        statusCode: HttpStatus.OK,
        data: await this.assetService.updateAssetTransactionStatus(
          lang,
          id,
          auth._id,
          status,
        ),
        pagination: null,
        message: ApiMessageKey.UPDATE_TRANSACTION_STATUS_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Post('fiat-deposit')
  @ApiOperation({
    summary: 'Create fiat deposit transaction',
    description: 'Create fiat deposit transaction',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async fiatDeposit(
    @Language() lang: Lang,
    @Auth() auth: IAccessTokenAuth,
    @Body() dto: FiatDepositDto,
  ): Promise<ApiResponseDto<boolean>> {
    try {
      const userId = auth._id;
      const result = await this.transactionService.fiatDeposit(lang, dto, userId);

      return new ApiResponseDto<boolean>({
        statusCode: HttpStatus.OK,
        data: result,
        pagination: null,
        message: ApiMessageKey.FIAT_DEPOSIT_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }
}

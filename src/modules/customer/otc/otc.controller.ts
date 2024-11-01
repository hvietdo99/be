import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { OtcService } from './otc.service';
import { CreateOtcOrderDto, OtcOrderResponseDto } from './dto/create-otc-order.dto';
import { AuthGuard, IAccessTokenAuth } from '@common/guards/auth.guard';
import { ApiResponseDto, Lang } from '@common/classes/response.dto';
import { Language } from '@common/decorators/lang.decorator';
import { Auth } from '@common/decorators/auth.decorator';
import { ApiMessageKey } from '@common/constants/message.constants';
import { GetPriceQuoteDto, PriceQuoteResponseDto } from './dto/price-quote.dto';
import { GetTransactionHistoryDto } from './dto/get-transaction-history.dto';
import { TransactionHistoryResponseDto } from './dto/get-transaction-history.dto';

@Controller('customer/otc')
export class OtcController {
  constructor(private readonly otcService: OtcService) {}

  @Get('history')
  @ApiOperation({
    summary: 'Get transaction history',
    description: 'Get paginated USDT transaction history with filters',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<TransactionHistoryResponseDto[]> })
  async getTransactionHistory(
    @Auth() auth: IAccessTokenAuth,
    @Language() lang: Lang,
    @Query() query: GetTransactionHistoryDto,
  ): Promise<ApiResponseDto<TransactionHistoryResponseDto[]>> {
    const { data, pagination } = await this.otcService.getTransactionHistory(
      auth._id,
      query,
      lang,
    );

    return new ApiResponseDto<TransactionHistoryResponseDto[]>({
      statusCode: HttpStatus.OK,
      data,
      pagination,
      message: ApiMessageKey.GET_TRANSACTION_HISTORY_SUCCESS,
      lang,
    });
  }

  @Post('quote')
  @ApiOperation({
    summary: 'Get price quote',
    description: 'Get current price quote for OTC order',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<PriceQuoteResponseDto> })
  async getPriceQuote(
    @Language() lang: Lang,
    @Body() dto: GetPriceQuoteDto,
  ): Promise<ApiResponseDto<PriceQuoteResponseDto>> {
    const data = await this.otcService.getPriceQuote(dto.type, dto.amount);

    return new ApiResponseDto<PriceQuoteResponseDto>({
      statusCode: HttpStatus.OK,
      data,
      message: ApiMessageKey.GET_QUOTE_SUCCESS,
      pagination: null,
      lang,
    });
  }

  @Post('order')
  @ApiOperation({
    summary: 'Create OTC order',
    description: 'Create buy/sell OTC order',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<OtcOrderResponseDto> })
  async createOrder(
    @Auth() auth: IAccessTokenAuth,
    @Language() lang: Lang,
    @Body() dto: CreateOtcOrderDto,
  ): Promise<ApiResponseDto<OtcOrderResponseDto>> {
    const data = await this.otcService.createOrder(auth._id, dto, lang);

    return new ApiResponseDto<OtcOrderResponseDto>({
      statusCode: HttpStatus.OK,
      data,
      message: ApiMessageKey.CREATE_TRANSACTION_SUCCESS,
      pagination: null,
      lang,
    });
  }

  @Post('order/:id/complete')
  @ApiOperation({
    summary: 'Complete OTC order',
    description: 'Complete OTC order and update balances',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async completeOrder(
    @Language() lang: Lang,
    @Param('id') orderId: string,
  ): Promise<ApiResponseDto<boolean>> {
    const data = await this.otcService.completeOrder(orderId, lang);

    return new ApiResponseDto<boolean>({
      statusCode: HttpStatus.OK,
      data,
      message: ApiMessageKey.UPDATE_TRANSACTION_STATUS_SUCCESS,
      pagination: null,
      lang,
    });
  }

  @Post('order/:id/cancel')
  @ApiOperation({
    summary: 'Cancel OTC order',
    description: 'Cancel pending OTC order',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async cancelOrder(
    @Auth() auth: IAccessTokenAuth,
    @Language() lang: Lang,
    @Param('id') orderId: string,
  ): Promise<ApiResponseDto<boolean>> {
    const data = await this.otcService.cancelOrder(orderId, auth._id, lang);

    return new ApiResponseDto<boolean>({
      statusCode: HttpStatus.OK,
      data,
      message: ApiMessageKey.UPDATE_TRANSACTION_STATUS_SUCCESS,
      pagination: null,
      lang,
    });
  }
}

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
import { BasicHeader } from '@common/decorators/basic-header.decorator';
import { AssetService } from '@modules/customer/asset/asset.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AuthGuard, IAccessTokenAuth } from '@common/guards/auth.guard';
import {
  ApiResponseDto,
  Lang,
  PaginatedResponse,
} from '@common/classes/response.dto';
import { FindAllAssetResponseDto } from '@modules/admin/asset/dto/find-all-asset.dto';
import { Language } from '@common/decorators/lang.decorator';
import { ApiMessageKey } from '@common/constants/message.constants';
import {
  GetAllPublicAssetDto,
  GetAllPublicAssetResponseDto,
} from '@modules/customer/asset/dto/get-all-public-asset.dto';
import { GetAssetDetailResponseDto } from '@modules/admin/asset/dto/get-asset-detail.dto';
import { Auth } from '@common/decorators/auth.decorator';
import { CreateAssetTransactionDto } from '@modules/customer/asset/dto/create-asset-transaction.dto';
import { TransactionType } from '@modules/database/schemas/transaction.schema';
import {
  GetAllAssetTransactionDto,
  GetAllAssetTransactionResponse,
} from '@modules/customer/asset/dto/get-all-asset-transaction.dto';
import { UpdateAssetTransactionStatusDto } from '@modules/customer/asset/dto/update-asset-transaction-status.dto';

@BasicHeader('Asset')
@Controller('customer/asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all public assets',
    description: 'Get all public assets',
  })
  @ApiOkResponse({ type: ApiResponseDto<GetAllPublicAssetResponseDto[]> })
  async findAll(@Language() lang: Lang, @Query() query: GetAllPublicAssetDto) {
    try {
      const { data, pagination }: PaginatedResponse<FindAllAssetResponseDto> =
        await this.assetService.getAll(query);

      return new ApiResponseDto<GetAllPublicAssetResponseDto[]>({
        statusCode: HttpStatus.OK,
        data,
        pagination,
        message: ApiMessageKey.GET_ALL_ASSET_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Get('transaction')
  @ApiOperation({
    summary: 'Get all public assets',
    description: 'Get all public assets',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<GetAllAssetTransactionResponse[]> })
  async getAllAssetTransaction(
    @Language() lang: Lang,
    @Auth() auth: IAccessTokenAuth,
    @Query() query: GetAllAssetTransactionDto,
  ) {
    try {
      const { data, pagination }: PaginatedResponse<GetAllAssetTransactionResponse> =
        await this.assetService.getAllAssetTransaction(auth._id, query);

      return new ApiResponseDto<GetAllAssetTransactionResponse[]>({
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
    summary: 'Get asset detail',
    description: 'Get asset detail',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<GetAssetDetailResponseDto> })
  async getOne(@Language() lang: Lang, @Param('id') id: string) {
    try {
      const data: GetAssetDetailResponseDto = await this.assetService.getOne(id);

      return new ApiResponseDto<GetAssetDetailResponseDto>({
        statusCode: HttpStatus.OK,
        data,
        pagination: null,
        message: ApiMessageKey.GET_ASSET_DETAIL_SUCCESS,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Post('transaction')
  @ApiOperation({
    summary: 'Get asset detail',
    description: 'Get asset detail',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async createAssetTransaction(
    @Auth() auth: IAccessTokenAuth,
    @Language() lang: Lang,
    @Body() body: CreateAssetTransactionDto,
  ) {
    try {
      let message = ApiMessageKey.CREATE_TRANSACTION_SUCCESS;
      switch (body.type) {
        case TransactionType.DEPOSIT:
          message = ApiMessageKey.DEPOSIT_SUCCESS;
          break;
        case TransactionType.WITHDRAW:
          message = ApiMessageKey.WITHDRAW_SUCCESS;
          break;
        default:
          break;
      }

      return new ApiResponseDto<boolean>({
        statusCode: HttpStatus.OK,
        data: await this.assetService.createAssetTransaction(lang, auth._id, body),
        pagination: null,
        message,
        lang,
      });
    } catch (err) {
      throw err;
    }
  }

  @Patch('transaction/:id')
  @ApiOperation({
    summary: 'Update asset transaction status',
    description: 'Update asset transaction status',
  })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async updateAssetTransactionStatus(
    @Auth() auth: IAccessTokenAuth,
    @Language() lang: Lang,
    @Param('id') id: string,
    @Body() { status }: UpdateAssetTransactionStatusDto,
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
}

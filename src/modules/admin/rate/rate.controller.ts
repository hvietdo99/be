import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { RateService } from './rate.service';
import { AuthGuard, IAccessTokenAuth } from '@common/guards/auth.guard';
import { RoleGuard } from '@common/guards/role.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@modules/database/schemas/user.schema';
import { ApiResponseDto, Lang } from '@common/classes/response.dto';
import { Language } from '@common/decorators/lang.decorator';
import { Auth } from '@common/decorators/auth.decorator';
import { ApiMessageKey } from '@common/constants/message.constants';
import { UpdateRateDto } from './dto/update-rate.dto';
import { GetRateHistoryDto } from './dto/get-rate-history.dto';
import { RateHistoryResponseDto } from './dto/rate-history-response.dto';

@Controller('admin/rate')
export class RateController {
  constructor(private readonly rateService: RateService) {}

  @Get('current')
  @ApiOperation({
    summary: 'Get current USDT/USD rate',
    description: 'Get the current conversion rate for USDT to USD',
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles([UserRole.ADMIN, UserRole.SU])
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<number> })
  async getCurrentRate(@Language() lang: Lang): Promise<ApiResponseDto<number>> {
    const rate = await this.rateService.getCurrentRate();

    return new ApiResponseDto<number>({
      statusCode: HttpStatus.OK,
      data: rate,
      message: ApiMessageKey.GET_CURRENT_RATE_SUCCESS,
      pagination: null,
      lang,
    });
  }

  @Post()
  @ApiOperation({
    summary: 'Update USDT/USD rate',
    description: 'Update the conversion rate for USDT to USD',
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles([UserRole.ADMIN, UserRole.SU])
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<boolean> })
  async updateRate(
    @Auth() auth: IAccessTokenAuth,
    @Language() lang: Lang,
    @Body() dto: UpdateRateDto,
  ): Promise<ApiResponseDto<boolean>> {
    const success = await this.rateService.updateRate(auth._id, dto, lang);

    return new ApiResponseDto<boolean>({
      statusCode: HttpStatus.OK,
      data: success,
      message: ApiMessageKey.UPDATE_RATE_SUCCESS,
      pagination: null,
      lang,
    });
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get rate update history',
    description: 'Get paginated history of USDT/USD rate updates',
  })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles([UserRole.ADMIN, UserRole.SU])
  @ApiBearerAuth()
  @ApiOkResponse({ type: ApiResponseDto<RateHistoryResponseDto[]> })
  async getRateHistory(
    @Language() lang: Lang,
    @Query() query: GetRateHistoryDto,
  ): Promise<ApiResponseDto<RateHistoryResponseDto[]>> {
    const { data, pagination } = await this.rateService.getRateHistory(query, lang);

    return new ApiResponseDto<RateHistoryResponseDto[]>({
      statusCode: HttpStatus.OK,
      data,
      pagination,
      message: ApiMessageKey.GET_RATE_HISTORY_SUCCESS,
      lang,
    });
  }
}

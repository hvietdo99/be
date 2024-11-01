import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UsdtRate,
  UsdtRateDocument,
} from '@src/modules/database/schemas/usdt-rate.schema';
import { UpdateRateDto } from './dto/update-rate.dto';
import { GetRateHistoryDto } from './dto/get-rate-history.dto';
import { ErrorCode } from '@common/constants/error.constants';
import { Lang, PaginatedResponse } from '@common/classes/response.dto';
import { getErrorMessage, toObjectId } from '@common/utils/utils';
import { RateHistoryResponseDto } from './dto/rate-history-response.dto';

@Injectable()
export class RateService {
  constructor(
    @InjectModel(UsdtRate.name)
    private readonly usdtRateModel: Model<UsdtRateDocument>,
  ) {}

  async getCurrentRate(): Promise<number> {
    const latestRate = await this.usdtRateModel
      .findOne()
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return latestRate?.rate || 1.0; // Default to 1:1 if no rate set
  }

  async updateRate(
    adminId: string,
    dto: UpdateRateDto,
    lang: Lang,
  ): Promise<boolean> {
    if (dto.rate <= 0) {
      throw new BadRequestException(getErrorMessage(ErrorCode.INVALID_RATE, lang));
    }

    await this.usdtRateModel.create({
      rate: dto.rate,
      note: dto.note,
      updatedBy: toObjectId(adminId),
    });

    return true;
  }

  async getRateHistory(
    query: GetRateHistoryDto,
    lang: Lang,
  ): Promise<PaginatedResponse<RateHistoryResponseDto>> {
    const filter = {};

    if (query.startDate || query.endDate) {
      filter['createdAt'] = {};
      if (query.startDate) {
        filter['createdAt'].$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        filter['createdAt'].$lte = new Date(query.endDate);
      }
    }

    const [total, rates] = await Promise.all([
      this.usdtRateModel.countDocuments(filter),
      this.usdtRateModel
        .find(filter)
        .sort({ createdAt: query.order })
        .skip(query.offset)
        .limit(query.limit)
        .populate('updatedBy', 'name email')
        .lean()
        .exec(),
    ]);

    const data = rates.map(
      (rate) =>
        new RateHistoryResponseDto({
          id: rate._id.toString(),
          rate: rate.rate,
          note: rate.note,
          updatedBy: rate.updatedBy._id.toString(),
          createdAt: rate.createdAt,
        }),
    );

    return new PaginatedResponse(data, {
      page: query.page,
      limit: query.limit,
      total,
    });
  }
}

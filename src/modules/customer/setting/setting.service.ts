import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting, SettingDocument } from '@modules/database/schemas/setting.schema';
import { InitSettingDto } from '@modules/customer/setting/dto/init-setting.dto';
import { getErrorMessage, toObjectId } from '@common/utils/utils';
import { GetSettingResponseDto } from '@modules/customer/setting/dto/get-setting.dto';
import { AppConstants } from '@common/constants/app.constants';
import { Lang } from '@common/classes/response.dto';
import { UpdateSettingDto } from '@modules/customer/setting/dto/update-setting.dto';
import { ErrorCode } from '@common/constants/error.constants';

@Injectable()
export class SettingService {
  constructor(
    @InjectModel(Setting.name)
    private readonly settingModel: Model<Setting>,
  ) {}

  async init(userId: string, data: InitSettingDto): Promise<SettingDocument> {
    return await this.settingModel.create({
      currency: data.currency,
      lang: data.lang,
      verification: data.verification,
      chargeFee: data.chargeFee,
      userId: toObjectId(userId),
    });
  }

  async get(userId: string): Promise<GetSettingResponseDto> {
    const existed = await this.settingModel
      .findOne({ userId: toObjectId(userId) })
      .exec();
    if (existed) {
      return new GetSettingResponseDto(existed);
    }

    const data = await this.init(userId, {
      currency: AppConstants.DEFAULT_CURRENCY,
      lang: Lang.EN,
      verification: null,
      chargeFee: false,
    });

    return new GetSettingResponseDto(data);
  }

  async update(
    lang: Lang,
    id: string,
    userId: string,
    data: UpdateSettingDto,
  ): Promise<GetSettingResponseDto> {
    const existed = await this.settingModel.findOne({
      _id: toObjectId(id),
      userId: toObjectId(userId),
    });
    if (!existed) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.SETTING_NOT_FOUND, lang),
      );
    }

    const result = await this.settingModel
      .findOneAndUpdate(
        { _id: toObjectId(id), userId: toObjectId(userId) },
        {
          currency: data.currency,
          lang: data.lang,
          verification: data.verification,
          chargeFee: data.chargeFee,
          userId: toObjectId(userId),
        },
        { new: true, upsert: true },
      )
      .exec();

    return new GetSettingResponseDto(result);
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  VolumeSetting,
  VolumeSettingDocument,
} from '@modules/database/schemas/volume-setting.schema';
import { CreateVolumeSettingDto } from '@modules/admin/setting/dto/create-volume-setting.dto';
import {
  getCurrentVietnamTimeZone,
  getErrorMessage,
  toObjectId,
} from '@common/utils/utils';
import { ErrorCode } from '@common/constants/error.constants';
import {
  FindAndCountResponse,
  Lang,
  PaginatedResponse,
} from '@common/classes/response.dto';
import {
  GetAllVolumeSettingDto,
  GetAllVolumeSettingResponseDto,
} from '@modules/admin/setting/dto/get-all-volume-setting.dto';
import { FindAndCountDto } from '@common/classes/request.dto';
import { UpdateVolumeSettingDto } from '@modules/admin/setting/dto/update-volume-setting.dto';

@Injectable()
export class SettingService {
  constructor(
    @InjectModel(VolumeSetting.name)
    private readonly volumeSettingModel: Model<VolumeSettingDocument>,
  ) {}

  async findAndCountVolumeSetting(
    dto: FindAndCountDto<VolumeSettingDocument>,
  ): Promise<FindAndCountResponse<VolumeSettingDocument>> {
    const { condition, limit, offset, sort } = dto;
    const data = await this.volumeSettingModel
      .find(condition)
      .limit(limit)
      .skip(offset)
      .sort(sort)
      .exec();
    const total = await this.volumeSettingModel.countDocuments(condition).exec();

    return new FindAndCountResponse<VolumeSettingDocument>(data, total);
  }

  async getAllVolumeSetting(query: GetAllVolumeSettingDto) {
    const condition: FilterQuery<VolumeSettingDocument> = {
      deletedAt: null,
    };

    if (query.search) {
      condition.name = new RegExp(query.search, 'i');
    }

    const sort = { createdAt: query.order };

    const { data, total } = await this.findAndCountVolumeSetting({
      condition,
      limit: query.limit,
      offset: query.offset,
      sort,
    });

    return new PaginatedResponse(
      data.map((item) => new GetAllVolumeSettingResponseDto(item)),
      {
        page: query.page,
        limit: query.limit,
        total,
      },
    );
  }

  async createVolumeSetting(
    lang: Lang,
    data: CreateVolumeSettingDto,
  ): Promise<boolean> {
    const existedTier = await this.volumeSettingModel.findOne({
      tier: data.tier,
      deletedAt: null,
    });
    if (existedTier) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.VOLUME_TIER_EXISTED, lang),
      );
    }

    await this.volumeSettingModel.create(data);

    return true;
  }

  async updateVolumeSetting(
    lang: Lang,
    id: string,
    data: UpdateVolumeSettingDto,
  ): Promise<boolean> {
    const volumeSetting = await this.volumeSettingModel.findOne({
      _id: toObjectId(id),
      deletedAt: null,
    });
    if (!volumeSetting) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.VOLUME_SETTING_NOT_FOUND, lang),
      );
    }

    await this.volumeSettingModel.findByIdAndUpdate(id, data);

    return true;
  }

  async softDelete(id: string): Promise<boolean> {
    await this.volumeSettingModel
      .findByIdAndUpdate(
        id,
        { deletedAt: getCurrentVietnamTimeZone() },
        { new: true },
      )
      .exec();
    return true;
  }

  async deleteVolumeSetting(lang: Lang, id: string): Promise<boolean> {
    const volumeSetting = await this.volumeSettingModel.findOne({
      _id: toObjectId(id),
      deletedAt: null,
    });
    if (!volumeSetting) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.VOLUME_SETTING_NOT_FOUND, lang),
      );
    }

    return await this.softDelete(id);
  }
}

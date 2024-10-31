import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Asset, AssetDocument } from '@modules/database/schemas/asset.schema';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  FindAllAssetDto,
  FindAllAssetResponseDto,
} from '@modules/admin/asset/dto/find-all-asset.dto';
import { FindAndCountDto } from '@common/classes/request.dto';
import {
  FindAndCountResponse,
  Lang,
  PaginatedResponse,
} from '@common/classes/response.dto';
import {
  getCurrentVietnamTimeZone,
  getErrorMessage,
  toObjectId,
} from '@common/utils/utils';
import { SaveAssetDto } from '@modules/admin/asset/dto/save-asset.dto';
import { ErrorCode } from '@common/constants/error.constants';
import { GetAssetDetailResponseDto } from '@modules/admin/asset/dto/get-asset-detail.dto';
import { UpdateAssetDto } from '@modules/admin/asset/dto/update-asset.dto';

@Injectable()
export class AssetService {
  constructor(
    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetDocument>,
  ) {}

  async findAndCount(
    dto: FindAndCountDto<AssetDocument>,
  ): Promise<FindAndCountResponse<AssetDocument>> {
    const { condition, limit, offset, sort } = dto;
    const data = await this.assetModel
      .find(condition)
      .populate('creator')
      .limit(limit)
      .skip(offset)
      .sort(sort)
      .exec();
    const total = await this.assetModel.countDocuments(condition).exec();

    return new FindAndCountResponse<AssetDocument>(data, total);
  }

  async findAll(
    query: FindAllAssetDto,
  ): Promise<PaginatedResponse<FindAllAssetResponseDto>> {
    const condition: FilterQuery<AssetDocument> = {
      deletedAt: null,
    };

    if (query.status) {
      condition.status = query.status;
    }

    if (query.creatorId) {
      condition.creator = toObjectId(query.creatorId);
    }

    if (query.fromDate && query.toDate) {
      condition.createdAt = { $gte: query.fromDate, $lte: query.toDate };
    }

    if (query.search) {
      condition.address = new RegExp(query.search, 'i');
    }

    const sort = { createdAt: query.order };

    const { data, total } = await this.findAndCount({
      condition,
      limit: query.limit,
      offset: query.offset,
      sort,
    });

    return new PaginatedResponse(
      data.map((item) => new FindAllAssetResponseDto(item)),
      {
        page: query.page,
        limit: query.limit,
        total,
      },
    );
  }

  async findOne(id: string): Promise<GetAssetDetailResponseDto> {
    const data = await this.assetModel
      .findOne({ _id: toObjectId(id), deletedAt: null })
      .populate('creator')
      .exec();
    if (!data) return null;

    return new GetAssetDetailResponseDto(data);
  }

  async save(lang: Lang, userId: string, data: SaveAssetDto): Promise<boolean> {
    const externalId = new Types.ObjectId();

    const existed = await this.assetModel
      .findOne({ address: data.address, deletedAt: null })
      .exec();
    if (existed) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.ADDRESS_EXISTED, lang),
      );
    }

    // TODO: Integrate Copper
    // const copperDepositTarget = await this.copperService.createDepositTarget({
    //   externalId: externalId.toString(),
    //   currency: data.currency,
    //   mainCurrency: data.mainCurrency,
    //   name: data.name,
    //   metadata: [],
    //   portfolioId: '',
    // });

    await this.assetModel.create({
      _id: externalId,
      address: data.address,
      creator: toObjectId(userId),
      name: data.name,
      currency: data.currency,
      mainCurrency: data.mainCurrency,
      network: data.network,
      networkLogo: data.networkLogo,
      currencyLogo: data.currencyLogo,
      status: data.status,
    });

    return true;
  }

  async update(lang: Lang, id: string, data: UpdateAssetDto): Promise<boolean> {
    const asset = await this.assetModel.findById(id);
    if (!asset) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.ASSET_NOT_FOUND, lang),
      );
    }

    if (data.address) {
      const existedAddress = await this.assetModel
        .findOne({ address: data.address, deletedAt: null })
        .exec();
      if (existedAddress) {
        throw new BadRequestException(
          getErrorMessage(ErrorCode.ADDRESS_EXISTED, lang),
        );
      }
    }

    await this.assetModel.findByIdAndUpdate(id, {
      address: data.address,
      status: data.status,
      currency: data.currency,
      mainCurrency: data.mainCurrency,
    });

    return true;
  }

  async softDelete(id: string): Promise<boolean> {
    await this.assetModel
      .findByIdAndUpdate(
        id,
        { deletedAt: getCurrentVietnamTimeZone() },
        { new: true },
      )
      .exec();
    return true;
  }

  async delete(lang: Lang, id: string): Promise<boolean> {
    const asset = await this.assetModel.findById(id);
    if (!asset) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.ASSET_NOT_FOUND, lang),
      );
    }

    return await this.softDelete(id);
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Wallet, WalletDocument } from '@modules/database/schemas/wallet.schema';
import { FilterQuery, Model } from 'mongoose';
import { ConnectWalletDto } from '@modules/customer/wallet/dto/connect-wallet.dto';
import { getErrorMessage, toObjectId } from '@common/utils/utils';
import {
  FindAndCountResponse,
  Lang,
  PaginatedResponse,
} from '@common/classes/response.dto';
import { ErrorCode } from '@common/constants/error.constants';
import {
  GetAllWalletDto,
  GetAllWalletResponseDto,
} from '@modules/customer/wallet/dto/get-all-wallet.dto';
import { FindAndCountDto } from '@common/classes/request.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<Wallet>,
  ) {}

  async findAndCount(
    dto: FindAndCountDto<WalletDocument>,
  ): Promise<FindAndCountResponse<WalletDocument>> {
    const { condition, limit, offset, sort } = dto;
    const data = await this.walletModel
      .find(condition)
      .limit(limit)
      .skip(offset)
      .sort(sort)
      .exec();
    const total = await this.walletModel.countDocuments(condition).exec();

    return new FindAndCountResponse<WalletDocument>(data, total);
  }

  async getAll(userId: string, query: GetAllWalletDto) {
    const condition: FilterQuery<Wallet> = {
      user: toObjectId(userId),
      deletedAt: null,
    };
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
      data.map((item) => new GetAllWalletResponseDto(item)),
      {
        page: query.page,
        limit: query.limit,
        total,
      },
    );
  }

  async connect(
    lang: Lang,
    userId: string,
    dto: ConnectWalletDto,
  ): Promise<boolean> {
    const existed = await this.walletModel.findOne({ address: dto.address });
    if (existed) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.WALLET_HAS_BEEN_REGISTER, lang),
      );
    }

    const user = toObjectId(userId);
    await this.walletModel
      .findOneAndUpdate(
        { type: dto.type, user },
        {
          address: dto.address,
          type: dto.type,
          user,
        },
        { new: true, upsert: true },
      )
      .exec();

    return true;
  }

  async getWalletAddressByUserId(id: string): Promise<string[]> {
    const data = await this.walletModel.find({ user: toObjectId(id) }).exec();
    return data.map((item) => item.address);
  }
}

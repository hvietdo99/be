import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Asset,
  AssetDocument,
  AssetStatus,
} from '@modules/database/schemas/asset.schema';
import { FilterQuery, Model } from 'mongoose';
import {
  GetAllPublicAssetDto,
  GetAllPublicAssetResponseDto,
} from '@modules/customer/asset/dto/get-all-public-asset.dto';
import { AssetService as AdminAssetService } from '@modules/admin/asset/asset.service';
import { getErrorMessage, toObjectId } from '@common/utils/utils';
import {
  FindAndCountResponse,
  Lang,
  PaginatedResponse,
} from '@common/classes/response.dto';
import { GetAssetDetailResponseDto } from '@modules/admin/asset/dto/get-asset-detail.dto';
import { CreateAssetTransactionDto } from '@modules/customer/asset/dto/create-asset-transaction.dto';
import {
  Transaction,
  TransactionDocument,
  TransactionStatus,
  TransactionType,
} from '@modules/database/schemas/transaction.schema';
import { ErrorCode } from '@common/constants/error.constants';
import {
  GetAllAssetTransactionDto,
  GetAllAssetTransactionResponse,
} from '@modules/customer/asset/dto/get-all-asset-transaction.dto';
import { FindAndCountDto } from '@common/classes/request.dto';
import { WalletService } from '@modules/customer/wallet/wallet.service';
import { UserService } from '@modules/admin/user/user.service';
import { Network } from '@src/modules/database/schemas/user.schema';

@Injectable()
export class AssetService {
  constructor(
    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,

    private readonly adminAssetService: AdminAssetService,
    private readonly walletService: WalletService,
    private readonly userService: UserService,
  ) {}

  async getAll(query: GetAllPublicAssetDto) {
    const condition: FilterQuery<AssetDocument> = {
      deletedAt: null,
      status: AssetStatus.PUBLIC,
    };

    if (query.fromDate && query.toDate) {
      condition.createdAt = { $gte: query.fromDate, $lte: query.toDate };
    }

    if (query.creatorId) {
      condition.creator = toObjectId(query.creatorId);
    }

    if (query.search) {
      condition.address = new RegExp(query.search, 'i');
    }

    const sort = { createdAt: query.order };

    const { data, total } = await this.adminAssetService.findAndCount({
      condition,
      limit: query.limit,
      offset: query.offset,
      sort,
    });

    return new PaginatedResponse(
      data.map((item) => new GetAllPublicAssetResponseDto(item)),
      {
        page: query.page,
        limit: query.limit,
        total,
      },
    );
  }

  async getOne(id: string): Promise<GetAssetDetailResponseDto> {
    const data = await this.assetModel
      .findOne({ _id: toObjectId(id), status: AssetStatus.PUBLIC, deletedAt: null })
      .populate('creator')
      .exec();
    if (!data) return null;

    return new GetAssetDetailResponseDto(data);
  }

  async findAndCountTransaction(
    dto: FindAndCountDto<TransactionDocument>,
  ): Promise<FindAndCountResponse<TransactionDocument>> {
    const { condition, limit, offset, sort } = dto;
    const data = await this.transactionModel
      .find(condition)
      .limit(limit)
      .skip(offset)
      .sort(sort)
      .exec();
    const total = await this.transactionModel.countDocuments(condition).exec();

    return new FindAndCountResponse<TransactionDocument>(data, total);
  }

  async getAllAssetTransaction(
    userId: string,
    query: GetAllAssetTransactionDto,
  ): Promise<PaginatedResponse<GetAllAssetTransactionResponse>> {
    const masterWallet = await this.userService.findMaster();
    const reserveWallet = await this.userService.findReserveWallet();
    const address = await this.userService.getWalletAddressByUserId(userId);

    const condition: FilterQuery<TransactionDocument> = {
      deletedAt: null,
      $nor: [
        {
          type: TransactionType.DEPOSIT,
          toAddress: masterWallet.addresses[Network.BEP20],
        },
        {
          type: TransactionType.DEPOSIT,
          toAddress: masterWallet.addresses[Network.ERC20],
        },
        {
          type: TransactionType.DEPOSIT,
          toAddress: masterWallet.addresses[Network.TRC20],
        },
      ],
      $or: [{ fromAddress: address }, { toAddress: address }],
      type: { $in: [TransactionType.DEPOSIT, TransactionType.WITHDRAW] },
    };

    if (query.fromDate && query.toDate) {
      condition.createdAt = { $gte: query.fromDate, $lte: query.toDate };
    }

    if (query.search) {
      condition.tx = new RegExp(query.search, 'i');
    }

    if (query.assetAddress) {
      condition.toAddress = query.assetAddress;
    }

    const sort = { createdAt: query.order };

    const { data, total } = await this.findAndCountTransaction({
      condition,
      limit: query.limit,
      offset: query.offset,
      sort,
    });

    return new PaginatedResponse(
      data.map((item) => new GetAllAssetTransactionResponse(item)),
      {
        page: query.page,
        limit: query.limit,
        total,
      },
    );
  }

  async createAssetTransaction(
    lang: Lang,
    userId: string,
    data: CreateAssetTransactionDto,
  ): Promise<boolean> {
    const asset = await this.assetModel
      .findOne({
        address: data.toAddress,
        status: AssetStatus.PUBLIC,
        deletedAt: null,
      })
      .exec();

    if (!asset) {
      throw new BadRequestException(getErrorMessage(ErrorCode.INVALID_ASSET, lang));
    }

    const existedTx = await this.transactionModel.findOne({ tx: data.tx }).exec();
    if (existedTx) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.TRANSACTION_TX_EXISTED, lang),
      );
    }

    await this.assetModel
      .findByIdAndUpdate(asset._id, { owner: toObjectId(userId) }, { new: true })
      .exec();

    await this.transactionModel.create({
      fromAddress: data.fromAddress,
      toAddress: data.toAddress,
      tx: data.tx,
      type: data.type,
      amount: data.amount,
      network: data.network,
      paymentMethod: data.paymentMethod,
    });

    return true;
  }

  async updateAssetTransactionStatus(
    lang: Lang,
    id: string,
    userId: string,
    status: TransactionStatus,
  ): Promise<boolean> {
    const wallets = await this.walletService.getWalletAddressByUserId(userId);
    const transaction = await this.transactionModel
      .findOne({
        _id: toObjectId(id),
      })
      .exec();
    if (!transaction) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.TRANSACTION_NOT_FOUND, lang),
      );
    }

    if (
      !wallets.includes(transaction.fromAddress) &&
      !wallets.includes(transaction.toAddress)
    ) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.PERMISSION_DENIED, lang),
      );
    }

    await this.transactionModel.findByIdAndUpdate(id, { status }).exec();

    return true;
  }
}

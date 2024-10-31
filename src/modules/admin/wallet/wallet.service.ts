import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import {
  MasterWallet,
  MasterWalletDocument,
  MasterWalletType,
} from '@modules/database/schemas/master-wallet.schema';
import mongoose, { Model } from 'mongoose';
import { FindMasterWalletResponseDto } from '@modules/admin/wallet/dto/find-master-wallet.dto';
import { CreateMasterWalletDto } from '@modules/admin/wallet/dto/create-master-wallet.dto';
import { getErrorMessage } from '@common/utils/utils';
import { ErrorCode } from '@common/constants/error.constants';
import { Lang } from '@common/classes/response.dto';
import { BSCUSD_ADDRESS } from '@common/utils/blockchain/bsc';
import { UpdateMasterWalletBalanceDto } from '@modules/admin/wallet/dto/update-master-wallet-balance.dto';
import { UpdateMasterWalletDto } from '@modules/admin/wallet/dto/update-master-wallet.dto';
import { AuthService } from '@src/modules/auth/auth.service';
import { Network } from '@src/modules/database/schemas/user.schema';
import { TronWeb } from 'tronweb';
import { ethers } from 'ethers';
import { removeHexPrefix } from '@src/common/utils/blockchain';

@Injectable()
export class WalletService {
  constructor(
    @InjectConnection()
    private readonly connection: mongoose.Connection,
    @InjectModel(MasterWallet.name)
    private readonly masterWalletModel: Model<MasterWalletDocument>,

    private readonly authService: AuthService,
  ) {}

  async findMasterWallet() {
    const data = await this.masterWalletModel
      .findOne({ type: MasterWalletType.RESERVE_WALLET, deletedAt: null })
      .exec();
    if (!data) return null;
    return new FindMasterWalletResponseDto(data);
  }

  async createMasterWallet(lang: Lang, dto: CreateMasterWalletDto) {
    const wallet = await this.masterWalletModel
      .findOne({ type: dto.type, deletedAt: null })
      .exec();
    if (wallet) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.MASTER_WALLET_EXISTED, lang),
      );
    }

    const existedAddress = await this.masterWalletModel
      .findOne({
        prvKey: this.authService.encryptPrivateKey(dto.prvKey),
        deletedAt: null,
      })
      .exec();
    if (existedAddress) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.ADDRESS_EXISTED, lang),
      );
    }

    // Generate addresses for different networks
    const addresses = {
      [Network.ERC20]: new ethers.Wallet(dto.prvKey).address,
      [Network.BEP20]: new ethers.Wallet(dto.prvKey).address,
      [Network.TRC20]: TronWeb.address.fromPrivateKey(removeHexPrefix(dto.prvKey)),
    };

    await this.masterWalletModel.create({
      addresses,
      balance: {
        [Network.ERC20]: 0,
        [Network.BEP20]: 0,
        [Network.TRC20]: 0,
      },
      prvKey: this.authService.encryptPrivateKey(dto.prvKey),
      type: dto.type,
    });

    return true;
  }

  async updateMasterWallet(
    lang: Lang,
    id: string,
    data: UpdateMasterWalletDto,
  ): Promise<boolean> {
    const wallet = await this.masterWalletModel.findById(id).exec();
    if (!wallet) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.MASTER_WALLET_NOT_FOUND, lang),
      );
    }

    await this.masterWalletModel.findByIdAndUpdate(id, {
      address: data.address,
      prvKey: data.prvKey,
    });

    return true;
  }

  async updateMasterWalletBalance(
    lang: Lang,
    dto: UpdateMasterWalletBalanceDto,
  ): Promise<boolean> {
    const wallet = await this.masterWalletModel
      .findOne({ type: dto.type, deletedAt: null })
      .exec();
    if (!wallet) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.MASTER_WALLET_NOT_FOUND, lang),
      );
    }

    await this.masterWalletModel.findByIdAndUpdate(
      { _id: wallet._id },
      {
        $inc: {
          [`balance.${BSCUSD_ADDRESS}`]: dto.balance,
        },
      },
    );

    return true;
  }

  async deleteMasterWallet(lang: Lang, id: string): Promise<boolean> {
    const wallet = await this.masterWalletModel.findById(id).exec();
    if (!wallet) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.MASTER_WALLET_NOT_FOUND, lang),
      );
    }

    await this.masterWalletModel.findByIdAndUpdate(id, { deletedAt: new Date() });
    return true;
  }
}

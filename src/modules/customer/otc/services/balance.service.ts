import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Network, User, UserDocument } from '@modules/database/schemas/user.schema';
import { ClientSession } from 'mongoose';
import { MasterWalletDocument } from '@src/modules/database/schemas/master-wallet.schema';

@Injectable()
export class OtcBalanceService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly masterWalletModel: Model<MasterWalletDocument>,
  ) {}

  async processInstantPurchase(
    userId: string,
    usdtAmount: number,
    fiatAmount: number,
    network: Network,
    session?: ClientSession,
  ): Promise<boolean> {
    const user = await this.userModel.findById(userId).session(session);
    if (!user) {
      return false;
    }

    if (user.fiat < fiatAmount) {
      return false;
    }

    try {
      const result = await this.userModel.updateOne(
        {
          _id: user._id,
          fiat: { $gte: fiatAmount },
        },
        {
          $inc: {
            fiat: -fiatAmount,
            [`balance.${network}`]: usdtAmount,
          },
        },
        { session },
      );

      return result.modifiedCount === 1;
    } catch (error) {
      console.error('Failed to process instant purchase:', error);
      return false;
    }
  }

  async processInstantSell(
    userId: string,
    usdtAmount: number,
    fiatAmount: number,
    network: Network,
    session?: ClientSession,
  ): Promise<boolean> {
    const user = await this.userModel.findById(userId).session(session);
    if (!user) {
      return false;
    }

    const networkBalance = user.balance.get(network) || 0;
    if (networkBalance < usdtAmount) {
      return false;
    }

    try {
      const result = await this.userModel.updateOne(
        {
          _id: user._id,
          [`balance.${network}`]: { $gte: usdtAmount },
        },
        {
          $inc: {
            fiat: fiatAmount,
            [`balance.${network}`]: -usdtAmount,
          },
        },
        { session },
      );

      return result.modifiedCount === 1;
    } catch (error) {
      console.error('Failed to process instant sell:', error);
      return false;
    }
  }

  async processPreOrderPurchase(
    userId: string,
    usdtAmount: number,
    fiatAmount: number,
    network: Network,
    session?: ClientSession,
  ): Promise<boolean> {
    try {
      // Update user balances
      const userResult = await this.userModel.updateOne(
        {
          _id: userId,
          lockedFiat: { $gte: fiatAmount },
        },
        {
          $inc: {
            lockedFiat: -fiatAmount,
            [`balance.${network}`]: usdtAmount,
          },
        },
        { session },
      );

      if (userResult.modifiedCount !== 1) {
        return false;
      }

      // Update master wallet fiat balance
      const masterResult = await this.masterWalletModel.updateOne(
        { type: 'MASTER_WALLET' },
        { $inc: { fiat: fiatAmount } },
        { session },
      );

      return masterResult.modifiedCount === 1;
    } catch (error) {
      console.error('Failed to process pre-order purchase:', error);
      return false;
    }
  }

  async lockFiatBalance(
    userId: string,
    amount: number,
    session?: ClientSession,
  ): Promise<boolean> {
    try {
      const result = await this.userModel.updateOne(
        {
          _id: userId,
          fiat: { $gte: amount },
        },
        {
          $inc: {
            fiat: -amount,
            lockedFiat: amount,
          },
        },
        { session },
      );

      return result.modifiedCount === 1;
    } catch (error) {
      console.error('Failed to lock fiat balance:', error);
      return false;
    }
  }

  async unlockFiatBalance(
    userId: string,
    amount: number,
    session?: ClientSession,
  ): Promise<boolean> {
    try {
      const result = await this.userModel.updateOne(
        {
          _id: userId,
          lockedFiat: { $gte: amount },
        },
        {
          $inc: {
            fiat: amount,
            lockedFiat: -amount,
          },
        },
        { session },
      );

      return result.modifiedCount === 1;
    } catch (error) {
      console.error('Failed to unlock fiat balance:', error);
      return false;
    }
  }

  async checkBalance(
    userId: string,
    network: Network,
    amount: number,
  ): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      return false;
    }

    const networkBalance = user.balance.get(network) || 0;
    return networkBalance >= amount;
  }

  async checkFiatBalance(userId: string, amount: number): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      return false;
    }

    return user.fiat >= amount;
  }
}

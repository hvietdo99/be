import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@modules/database/schemas/user.schema';
import { OtcOrder, OtcOrderDocument } from '../schemas/otc-order.schema';

@Injectable()
export class OtcSecurityService {
  private readonly MAX_DAILY_VOLUME = 100000; // $100k daily limit
  private readonly MAX_SINGLE_ORDER = 50000; // $50k per order
  private readonly RATE_LIMIT_WINDOW = 3600; // 1 hour
  private readonly MAX_FAILED_ATTEMPTS = 5; // Max failed attempts per hour

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(OtcOrder.name)
    private readonly otcOrderModel: Model<OtcOrderDocument>,
  ) {}

  async validateOrderLimits(userId: string, amount: number): Promise<boolean> {
    // Check single order limit
    if (amount > this.MAX_SINGLE_ORDER) {
      return false;
    }

    // Calculate daily volume
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyOrders = await this.otcOrderModel.find({
      userId,
      createdAt: { $gte: today },
      status: { $ne: 'CANCELLED' },
    });

    const dailyVolume = dailyOrders.reduce(
      (sum, order) => sum + order.fiatAmount,
      0,
    );
    return dailyVolume + amount <= this.MAX_DAILY_VOLUME;
  }

  async checkRateLimit(userId: string): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - this.RATE_LIMIT_WINDOW * 1000);

    const failedAttempts = await this.otcOrderModel.countDocuments({
      userId,
      status: 'FAILED',
      createdAt: { $gte: oneHourAgo },
    });

    return failedAttempts < this.MAX_FAILED_ATTEMPTS;
  }

  async validateUserSecurity(userId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);

    // Require 2FA for large transactions
    if (!user.twoFA) {
      return false;
    }

    // Check if KYC is completed
    if (user.kycStatus !== 'APPROVED') {
      return false;
    }

    return true;
  }

  async detectSuspiciousActivity(order: OtcOrder): Promise<boolean> {
    // Check for unusual patterns
    const recentOrders = await this.otcOrderModel.find({
      userId: order.userId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    // Check for rapid small transactions
    const smallTransactions = recentOrders.filter((o) => o.amount < 1000).length;
    if (smallTransactions > 10) {
      return true;
    }

    // Check for unusual time patterns
    const unusualHourOrders = recentOrders.filter((o) => {
      const hour = new Date(o.createdAt).getHours();
      return hour >= 0 && hour <= 4; // Unusual trading hours
    }).length;

    if (unusualHourOrders > 5) {
      return true;
    }

    return false;
  }

  async logSecurityEvent(
    userId: string,
    eventType: string,
    details: any,
  ): Promise<void> {
    // In production, implement security event logging
    console.log(`Security Event - User: ${userId}, Type: ${eventType}`, details);
  }
}

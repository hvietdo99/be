import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import {
  OtcOrder,
  OtcOrderDocument,
  OtcOrderStatus,
  OtcOrderType,
} from '../schemas/otc-order.schema';
import { OtcBalanceService } from './balance.service';
import { OtcValidationService } from './validation.service';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from '@nestjs/schedule';
import { OtcPriceService } from './price.service';

@Injectable()
export class OrderProcessorService {
  private readonly logger = new Logger(OrderProcessorService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(OtcOrder.name)
    private readonly otcOrderModel: Model<OtcOrderDocument>,
    private readonly balanceService: OtcBalanceService,
    private readonly validationService: OtcValidationService,
    private readonly priceService: OtcPriceService,
  ) {}

  async processInstantOrder(orderId: string): Promise<boolean> {
    const session = await this.connection.startSession();

    try {
      let success = false;

      await session.withTransaction(async () => {
        const order = await this.otcOrderModel.findById(orderId).session(session);

        if (!order || !this.validationService.canCompleteOrder(order)) {
          throw new Error('Invalid order state');
        }

        // Pre-validate balance
        const hasBalance =
          order.type === OtcOrderType.BUY
            ? await this.balanceService.checkFiatBalance(
                order.userId.toString(),
                order.fiatAmount,
              )
            : await this.balanceService.checkBalance(
                order.userId.toString(),
                order.network,
                order.amount,
              );

        if (!hasBalance) {
          throw new Error('Insufficient balance');
        }

        // Process the order
        success =
          order.type === OtcOrderType.BUY
            ? await this.balanceService.processInstantPurchase(
                order.userId.toString(),
                order.amount,
                order.fiatAmount,
                order.network,
                session,
              )
            : await this.balanceService.processInstantSell(
                order.userId.toString(),
                order.amount,
                order.fiatAmount,
                order.network,
                session,
              );

        if (!success) {
          throw new Error('Failed to process order');
        }

        // Update order status
        await this.otcOrderModel.updateOne(
          { _id: order._id },
          {
            status: OtcOrderStatus.COMPLETED,
            updatedAt: new Date(),
          },
          { session },
        );
      });

      return success;
    } catch (error) {
      this.logger.error(`Failed to process instant order ${orderId}:`, error);
      return false;
    } finally {
      await session.endSession();
    }
  }

  async cancelPreOrder(orderId: string): Promise<boolean> {
    const session = await this.connection.startSession();

    try {
      let success = false;

      await session.withTransaction(async () => {
        const order = await this.otcOrderModel.findById(orderId).session(session);

        if (!order || !order.isPreOrder) {
          throw new Error('Invalid pre-order state');
        }

        // Unlock fiat balance for buy orders
        if (order.type === OtcOrderType.BUY && order.fiatDeposited) {
          success = await this.balanceService.unlockFiatBalance(
            order.userId.toString(),
            order.fiatAmount,
            session,
          );

          if (!success) {
            throw new Error('Failed to unlock fiat balance');
          }
        }

        // Update order status
        await this.otcOrderModel.updateOne(
          { _id: order._id },
          {
            status: OtcOrderStatus.CANCELLED,
            updatedAt: new Date(),
          },
          { session },
        );

        success = true;
      });

      return success;
    } catch (error) {
      this.logger.error(`Failed to cancel pre-order ${orderId}:`, error);
      return false;
    } finally {
      await session.endSession();
    }
  }

  async processPreOrder(orderId: string): Promise<boolean> {
    const session = await this.connection.startSession();

    try {
      let success = false;

      await session.withTransaction(async () => {
        const order = await this.otcOrderModel.findById(orderId).session(session);

        if (!order || !order.isPreOrder) {
          throw new Error('Invalid pre-order state');
        }

        // Get current market price
        const currentPrice = await this.priceService.getMarketPrice();

        // For buy orders, check if price matches
        if (order.type === OtcOrderType.BUY) {
          const priceMatches = Math.abs(currentPrice - order.price) < 0.001; // 0.1% tolerance

          if (priceMatches) {
            // Process order immediately if price matches
            success = await this.balanceService.processInstantPurchase(
              order.userId.toString(),
              order.amount,
              order.fiatAmount,
              order.network,
              session,
            );

            if (!success) {
              throw new Error('Failed to process purchase');
            }

            await this.otcOrderModel.updateOne(
              { _id: order._id },
              {
                status: OtcOrderStatus.COMPLETED,
                updatedAt: new Date(),
              },
              { session },
            );
          } else {
            // Lock fiat balance and wait for price match
            success = await this.balanceService.lockFiatBalance(
              order.userId.toString(),
              order.fiatAmount,
              session,
            );

            if (!success) {
              throw new Error('Failed to lock fiat balance');
            }

            await this.otcOrderModel.updateOne(
              { _id: order._id },
              {
                status: OtcOrderStatus.PROCESSING,
                updatedAt: new Date(),
              },
              { session },
            );
          }
        }

        success = true;
      });

      return success;
    } catch (error) {
      this.logger.error(`Failed to process pre-order ${orderId}:`, error);
      return false;
    } finally {
      await session.endSession();
    }
  }

  async processMatchedPreOrders(newRate: number): Promise<void> {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        // Find all pending buy pre-orders that match the new rate
        const matchingOrders = await this.otcOrderModel
          .find({
            isPreOrder: true,
            type: OtcOrderType.BUY,
            status: OtcOrderStatus.PROCESSING,
            price: {
              $gte: newRate * 0.999, // 0.1% tolerance
              $lte: newRate * 1.001,
            },
          })
          .session(session);

        for (const order of matchingOrders) {
          // Process each matching order
          const success = await this.balanceService.processPreOrderPurchase(
            order.userId.toString(),
            order.amount,
            order.fiatAmount,
            order.network,
            session,
          );

          if (success) {
            await this.otcOrderModel.updateOne(
              { _id: order._id },
              {
                status: OtcOrderStatus.COMPLETED,
                updatedAt: new Date(),
              },
              { session },
            );
          } else {
            this.logger.error(`Failed to process matched pre-order ${order._id}`);
          }
        }
      });
    } catch (error) {
      this.logger.error('Failed to process matched pre-orders:', error);
    } finally {
      await session.endSession();
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredPreOrders(): Promise<void> {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        const now = new Date();

        // Find expired pre-orders
        const expiredOrders = await this.otcOrderModel
          .find({
            isPreOrder: true,
            status: OtcOrderStatus.PROCESSING,
            expiresAt: { $lt: now },
          })
          .session(session);

        for (const order of expiredOrders) {
          if (order.type === OtcOrderType.BUY) {
            // Unlock fiat balance for expired buy orders
            await this.balanceService.unlockFiatBalance(
              order.userId.toString(),
              order.fiatAmount,
              session,
            );
          }

          // Update order status
          await this.otcOrderModel.updateOne(
            { _id: order._id },
            {
              status: OtcOrderStatus.CANCELLED,
              updatedAt: now,
            },
            { session },
          );
        }
      });
    } catch (error) {
      this.logger.error('Failed to handle expired pre-orders:', error);
    } finally {
      await session.endSession();
    }
  }
}

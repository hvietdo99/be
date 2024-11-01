import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  OtcOrder,
  OtcOrderDocument,
  OtcOrderStatus,
  OtcOrderType,
} from './schemas/otc-order.schema';
import { CreateOtcOrderDto, OtcOrderResponseDto } from './dto/create-otc-order.dto';
import { UserService } from '@modules/admin/user/user.service';
import { TransactionService } from '../transaction/transaction.service';
import { ErrorCode } from '@common/constants/error.constants';
import { Lang, PaginatedResponse } from '@common/classes/response.dto';
import { getErrorMessage, toObjectId } from '@common/utils/utils';
import { OtcPriceService } from './services/price.service';
import { OtcValidationService } from './services/validation.service';
import { PriceQuoteResponseDto } from './dto/price-quote.dto';
import { OrderProcessorService } from './services/order-processor.service';
import { OtcSecurityService } from './services/security.service';
import {
  GetTransactionHistoryDto,
  TransactionHistoryResponseDto,
} from './dto/get-transaction-history.dto';

@Injectable()
export class OtcService {
  private readonly FIAT_CURRENCY = 'USD';
  private readonly PRE_ORDER_EXPIRY_HOURS = 72; // 3 days

  constructor(
    @InjectModel(OtcOrder.name)
    private readonly otcOrderModel: Model<OtcOrderDocument>,
    private readonly userService: UserService,
    private readonly transactionService: TransactionService,
    private readonly priceService: OtcPriceService,
    private readonly validationService: OtcValidationService,
    private readonly orderProcessor: OrderProcessorService,
    private readonly securityService: OtcSecurityService,
  ) {}

  async getTransactionHistory(
    userId: string,
    query: GetTransactionHistoryDto,
    lang: Lang,
  ): Promise<PaginatedResponse<TransactionHistoryResponseDto>> {
    try {
      const filter: FilterQuery<OtcOrderDocument> = {
        userId: toObjectId(userId),
        deletedAt: null,
      };

      // Apply filters
      if (query.type) {
        filter.type = query.type;
      }

      if (query.status) {
        filter.status = query.status;
      }

      if (query.network) {
        filter.network = query.network;
      }

      if (query.txId) {
        filter.transactionId = new RegExp(query.txId, 'i');
      }

      // Date range filter
      if (query.startDate || query.endDate) {
        filter.createdAt = {};
        if (query.startDate) {
          filter.createdAt.$gte = new Date(query.startDate);
        }
        if (query.endDate) {
          filter.createdAt.$lte = new Date(query.endDate);
        }
      }

      // Execute queries concurrently
      const [total, orders] = await Promise.all([
        this.otcOrderModel.countDocuments(),
        this.otcOrderModel
          .find(filter)
          .sort({ createdAt: query.order })
          .skip(query.offset)
          .limit(query.limit)
          .lean()
          .exec(),
      ]);

      // Map to response DTOs
      const data = orders.map(
        (order) =>
          new TransactionHistoryResponseDto({
            id: order._id.toString(),
            type: order.type,
            status: order.status,
            amount: order.amount,
            price: order.price,
            fiatAmount: order.fiatAmount,
            fiatCurrency: order.fiatCurrency,
            network: order.network,
            txId: order.transactionId,
            createdAt: order.createdAt,
            completedAt:
              order.status === OtcOrderStatus.COMPLETED
                ? order.updatedAt
                : undefined,
          }),
      );

      return new PaginatedResponse(data, {
        page: query.page,
        limit: query.limit,
        total,
      });
    } catch (error) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.TRANSACTION_HISTORY_ERROR, lang),
      );
    }
  }

  async getPriceQuote(
    type: OtcOrderType,
    amount: number,
  ): Promise<PriceQuoteResponseDto> {
    return await this.priceService.getPriceQuote(type, amount);
  }

  async createOrder(
    userId: string,
    dto: CreateOtcOrderDto,
    lang: Lang,
  ): Promise<OtcOrderResponseDto> {
    // Security checks
    const isWithinLimits = await this.securityService.validateOrderLimits(
      userId,
      dto.amount,
    );
    if (!isWithinLimits) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.ORDER_LIMIT_EXCEEDED, lang),
      );
    }

    const isRateLimited = await this.securityService.checkRateLimit(userId);
    if (!isRateLimited) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.RATE_LIMIT_EXCEEDED, lang),
      );
    }

    const hasValidSecurity = await this.securityService.validateUserSecurity(userId);
    if (!hasValidSecurity) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.SECURITY_REQUIREMENTS_NOT_MET, lang),
      );
    }

    // Validate order parameters
    const validationError = await this.validationService.validateOrder(dto);
    if (validationError) {
      throw new BadRequestException(validationError);
    }

    // Get current price quote
    const quote = await this.getPriceQuote(dto.type, dto.amount);

    // Create order
    const order = await this.otcOrderModel.create({
      userId: toObjectId(userId),
      type: dto.type,
      amount: dto.amount,
      price: quote.price,
      fiatAmount: quote.fiatAmount,
      fiatCurrency: quote.fiatCurrency,
      network: dto.network,
      isPreOrder: dto.isPreOrder,
      expiresAt: dto.isPreOrder ? quote.validUntil : undefined,
      status: OtcOrderStatus.PENDING,
    });

    // Process order based on type
    if (dto.isPreOrder) {
      const success = await this.orderProcessor.processPreOrder(
        order._id.toString(),
      );
      if (!success) {
        throw new BadRequestException(
          getErrorMessage(ErrorCode.PRE_ORDER_PROCESSING_FAILED, lang),
        );
      }
    } else {
      const success = await this.orderProcessor.processInstantOrder(
        order._id.toString(),
      );
      if (!success) {
        throw new BadRequestException(
          getErrorMessage(ErrorCode.ORDER_PROCESSING_FAILED, lang),
        );
      }
    }

    // Check for suspicious activity
    const isSuspicious = await this.securityService.detectSuspiciousActivity(order);
    if (isSuspicious) {
      await this.securityService.logSecurityEvent(userId, 'SUSPICIOUS_ACTIVITY', {
        orderId: order._id,
        amount: dto.amount,
        type: dto.type,
      });
    }

    // Process instant orders
    if (!dto.isPreOrder) {
      const success = await this.orderProcessor.processInstantOrder(
        order._id.toString(),
      );
      if (!success) {
        throw new BadRequestException(
          getErrorMessage(ErrorCode.TRANSACTION_FAILED, lang),
        );
      }
    }

    return new OtcOrderResponseDto({
      id: order._id.toString(),
      type: order.type,
      amount: order.amount,
      price: order.price,
      fiatAmount: order.fiatAmount,
      fiatCurrency: order.fiatCurrency,
      network: order.network,
      isPreOrder: order.isPreOrder,
      expiresAt: order.expiresAt,
      status: order.status,
      createdAt: order.createdAt,
    });
  }

  async completeOrder(orderId: string, lang: Lang): Promise<boolean> {
    const order = await this.otcOrderModel.findById(orderId);
    if (!order) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.ORDER_NOT_FOUND, lang),
      );
    }

    if (!this.validationService.canCompleteOrder(order)) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.INVALID_ORDER_STATE, lang),
      );
    }

    const success = await this.orderProcessor.processInstantOrder(orderId);
    if (!success) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.TRANSACTION_FAILED, lang),
      );
    }

    return true;
  }

  async cancelOrder(orderId: string, userId: string, lang: Lang): Promise<boolean> {
    const order = await this.otcOrderModel.findById(orderId);
    if (!order) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.ORDER_NOT_FOUND, lang),
      );
    }

    if (order.userId.toString() !== userId) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.PERMISSION_DENIED, lang),
      );
    }

    if (!this.validationService.canCancelOrder(order)) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.INVALID_ORDER_STATE, lang),
      );
    }

    if (order.isPreOrder) {
      const success = await this.orderProcessor.cancelPreOrder(orderId);
      if (!success) {
        throw new BadRequestException(
          getErrorMessage(ErrorCode.TRANSACTION_FAILED, lang),
        );
      }
    } else {
      await this.otcOrderModel.updateOne(
        { _id: order._id },
        { status: OtcOrderStatus.CANCELLED },
      );
    }

    return true;
  }

  async getOrder(
    orderId: string,
    userId: string,
    lang: Lang,
  ): Promise<OtcOrderResponseDto> {
    const order = await this.otcOrderModel.findById(orderId);
    if (!order) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.ORDER_NOT_FOUND, lang),
      );
    }

    if (order.userId.toString() !== userId) {
      throw new BadRequestException(
        getErrorMessage(ErrorCode.PERMISSION_DENIED, lang),
      );
    }

    return new OtcOrderResponseDto({
      id: order._id.toString(),
      type: order.type,
      amount: order.amount,
      price: order.price,
      fiatAmount: order.fiatAmount,
      fiatCurrency: order.fiatCurrency,
      network: order.network,
      isPreOrder: order.isPreOrder,
      expiresAt: order.expiresAt,
      status: order.status,
      createdAt: order.createdAt,
    });
  }
}

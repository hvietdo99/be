import { Injectable } from '@nestjs/common';
import { OtcOrder, OtcOrderType } from '../schemas/otc-order.schema';
import { CreateOtcOrderDto } from '../dto/create-otc-order.dto';
import { OtcPriceService } from './price.service';

@Injectable()
export class OtcValidationService {
  constructor(private readonly priceService: OtcPriceService) {}

  async validateOrder(dto: CreateOtcOrderDto): Promise<string | null> {
    // Check amount limits
    const quote = await this.priceService.getPriceQuote(dto.type, dto.amount);

    if (dto.amount < quote.minAmount) {
      return `Order amount must be at least ${quote.minAmount} USDT`;
    }

    if (dto.amount > quote.maxAmount) {
      return `Order amount cannot exceed ${quote.maxAmount} USDT`;
    }

    // Validate price slippage (1% tolerance)
    const currentQuote = await this.priceService.getPriceQuote(dto.type, dto.amount);
    const slippagePercentage =
      Math.abs(dto.price - currentQuote.price) / currentQuote.price;

    if (slippagePercentage > 0.01) {
      return 'Price quote has expired. Please get a new quote.';
    }

    return null;
  }

  canCancelOrder(order: OtcOrder): boolean {
    if (order.isPreOrder) {
      return !order.fiatDeposited;
    }
    return true;
  }

  canCompleteOrder(order: OtcOrder): boolean {
    if (!order.fiatDeposited) {
      return false;
    }

    if (order.isPreOrder) {
      const now = new Date();
      return now >= order.expiresAt;
    }

    return true;
  }
}

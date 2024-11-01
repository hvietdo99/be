import { Injectable } from '@nestjs/common';
import { OtcOrderType } from '../schemas/otc-order.schema';
import { PriceQuoteResponseDto } from '../dto/price-quote.dto';
import { RateService } from '@modules/admin/rate/rate.service';

@Injectable()
export class OtcPriceService {
  private readonly QUOTE_VALIDITY_MINUTES = 5;
  private readonly MIN_AMOUNT = 100; // Minimum USDT amount
  private readonly MAX_AMOUNT = 100000; // Maximum USDT amount
  private readonly SPREAD_PERCENTAGE = 0.01; // 1% spread

  constructor(private readonly rateService: RateService) {}

  async getMarketPrice(): Promise<number> {
    return await this.rateService.getCurrentRate();
  }

  async getPriceQuote(
    type: OtcOrderType,
    amount: number,
  ): Promise<PriceQuoteResponseDto> {
    const marketPrice = await this.getMarketPrice();

    // Apply spread based on order type
    const price =
      type === OtcOrderType.BUY
        ? marketPrice * (1 + this.SPREAD_PERCENTAGE)
        : marketPrice * (1 - this.SPREAD_PERCENTAGE);

    const validUntil = new Date();
    validUntil.setMinutes(validUntil.getMinutes() + this.QUOTE_VALIDITY_MINUTES);

    return new PriceQuoteResponseDto({
      price,
      fiatAmount: amount * price,
      fiatCurrency: 'USD',
      validUntil,
      minAmount: this.MIN_AMOUNT,
      maxAmount: this.MAX_AMOUNT,
    });
  }

  isQuoteValid(quoteTime: Date): boolean {
    const now = new Date();
    const validUntil = new Date(quoteTime);
    validUntil.setMinutes(validUntil.getMinutes() + this.QUOTE_VALIDITY_MINUTES);
    return now <= validUntil;
  }
}

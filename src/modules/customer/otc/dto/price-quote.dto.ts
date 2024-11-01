import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { OtcOrderType } from '../schemas/otc-order.schema';

export class GetPriceQuoteDto {
  @ApiProperty({ enum: OtcOrderType, required: true })
  @IsEnum(OtcOrderType)
  @IsNotEmpty()
  type: OtcOrderType;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

export class PriceQuoteResponseDto {
  price: number;
  fiatAmount: number;
  fiatCurrency: string;
  validUntil: Date;
  minAmount: number;
  maxAmount: number;

  constructor(partial: Partial<PriceQuoteResponseDto>) {
    Object.assign(this, partial);
  }
}

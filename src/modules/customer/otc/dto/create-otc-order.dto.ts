import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { OtcOrderType } from '../schemas/otc-order.schema';
import { Network } from '@modules/database/schemas/user.schema';

export class CreateOtcOrderDto {
  @ApiProperty({ enum: OtcOrderType, required: true })
  @IsEnum(OtcOrderType)
  @IsNotEmpty()
  type: OtcOrderType;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ enum: Network, required: true })
  @IsEnum(Network)
  @IsNotEmpty()
  network: Network;

  @ApiProperty({ type: Boolean, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isPreOrder: boolean;
}

export class OtcOrderResponseDto {
  id: string;
  type: OtcOrderType;
  amount: number;
  price: number;
  fiatAmount: number;
  fiatCurrency: string;
  network: Network;
  isPreOrder: boolean;
  expiresAt?: Date;
  status: string;
  createdAt: Date;

  constructor(partial: Partial<OtcOrderResponseDto>) {
    Object.assign(this, partial);
  }
}

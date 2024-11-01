import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { OtcOrderStatus, OtcOrderType } from '../schemas/otc-order.schema';
import { Network } from '@modules/database/schemas/user.schema';
import { PageRequestDto } from '@common/classes/request.dto';

export class GetTransactionHistoryDto extends PageRequestDto {
  @ApiProperty({ enum: OtcOrderType, required: false })
  @IsEnum(OtcOrderType)
  @IsOptional()
  type?: OtcOrderType;

  @ApiProperty({ enum: OtcOrderStatus, required: false })
  @IsEnum(OtcOrderStatus)
  @IsOptional()
  status?: OtcOrderStatus;

  @ApiProperty({ enum: Network, required: false })
  @IsEnum(Network)
  @IsOptional()
  network?: Network;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  txId?: string;
}

export class TransactionHistoryResponseDto {
  id: string;
  type: OtcOrderType;
  status: OtcOrderStatus;
  amount: number;
  price: number;
  fiatAmount: number;
  fiatCurrency: string;
  network: Network;
  txId?: string;
  createdAt: Date;
  completedAt?: Date;

  constructor(partial: Partial<TransactionHistoryResponseDto>) {
    Object.assign(this, partial);
  }
}

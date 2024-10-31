import { RangeDateRequestDto } from '@common/classes/request.dto';
import {
  TransactionDocument,
  TransactionStatus,
  TransactionType,
} from '@modules/database/schemas/transaction.schema';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { toArray } from '@common/utils/utils';

export class GetAllTransactionDto extends RangeDateRequestDto {
  @ApiProperty({ type: TransactionStatus, enum: TransactionStatus, required: false })
  @IsEnum(TransactionStatus)
  @IsOptional()
  status: TransactionStatus;

  @ApiProperty({
    type: TransactionType,
    enum: TransactionType,
    required: false,
    isArray: true,
  })
  @IsOptional()
  @IsEnum(TransactionType, { each: true })
  @Transform(({ value }) => toArray(value))
  type: TransactionType[];

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  paymentMethod: string;
}

export class GetAllTransactionResponseDto {
  _id: string;
  fromAddress: string;
  toAddress: string;
  price: number;
  closedPrice: number;
  amount: number;
  network: string;
  tx: string;
  type: string;
  status: TransactionStatus;
  createdAt: Date;

  constructor(props: TransactionDocument) {
    this._id = props._id.toString();
    this.tx = props.tx;
    this.fromAddress = props.fromAddress;
    this.toAddress = props.toAddress || null;
    this.price = props.price;
    this.closedPrice = props.closedPrice || null;
    this.amount = props.amount;
    this.network = props.network;
    this.type = props.type;
    this.status = props.status;
    this.createdAt = props.createdAt;
  }
}

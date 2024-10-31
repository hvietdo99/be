import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import {
  TransactionDocument,
  TransactionStatus,
  TransactionType,
} from '@modules/database/schemas/transaction.schema';
import { lowerCaseTransformer } from '@src/common/utils/lower-case.transformer';
import { Transform } from 'class-transformer';
import { Network } from '@src/modules/database/schemas/user.schema';

export class DepositTokenDto {
  @ApiProperty({ example: '0x63CC8C656241b5EBA753E782E7603119Ba6d509e' })
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @ApiProperty({ example: 5 })
  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber()
  @IsPositive({ message: 'Amount is invalid' })
  amount: number;
}

export class WithdrawOrderDto {
  // @ApiProperty({ example: '0x0000000000000000000000000000000000000000' })
  // @IsNotEmpty({ message: 'TOKEN_ADDRESS_REQUIRED' })
  // token: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'Amount is required' })
  @IsPositive({ message: 'Amount is invalid' })
  amount: number;

  @ApiProperty({ example: '0x8d036A756d379CdE6B40a202e87FbbDE17Efa8B1' })
  @IsString({ message: 'Address is invalid' })
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @ApiProperty({ example: 'BSC' })
  @IsNotEmpty({ message: 'NETWORK_REQUIRED' })
  network: Network;

  @ApiProperty({ example: '324546' })
  @IsString({ message: 'Code is invalid' })
  @Transform(lowerCaseTransformer)
  twoFACode: string;
}

export class WithdrawResponseDto {
  _id: string;
  tx: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  price: number;
  closedPrice: number;
  paymentMethod: string;
  network: string;
  status: TransactionStatus;
  type: TransactionType;

  constructor(props: TransactionDocument) {
    this._id = props._id.toString();
    this.tx = props.tx;
    this.fromAddress = props.fromAddress;
    this.toAddress = props.toAddress;
    this.amount = props.amount;
    this.price = props.price;
    this.closedPrice = props.closedPrice;
    this.paymentMethod = props.paymentMethod;
    this.network = props.network;
    this.status = props.status;
    this.type = props.type;
  }
}

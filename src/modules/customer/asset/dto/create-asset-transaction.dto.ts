import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@modules/database/schemas/transaction.schema';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAssetTransactionDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  fromAddress: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  toAddress: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  tx: string;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ type: TransactionType, enum: TransactionType, required: true })
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  network: string;
}

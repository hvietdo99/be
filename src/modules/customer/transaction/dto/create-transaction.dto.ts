import { TransactionType } from '@modules/database/schemas/transaction.schema';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  tx: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  fromAddress: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  toAddress: string;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  @IsNotEmpty()
  price: number;

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

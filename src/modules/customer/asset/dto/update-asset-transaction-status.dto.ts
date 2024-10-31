import { TransactionStatus } from '@modules/database/schemas/transaction.schema';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateAssetTransactionStatusDto {
  @ApiProperty({ type: TransactionStatus, enum: TransactionStatus, required: true })
  @IsEnum(TransactionStatus)
  @IsNotEmpty()
  status: TransactionStatus;
}

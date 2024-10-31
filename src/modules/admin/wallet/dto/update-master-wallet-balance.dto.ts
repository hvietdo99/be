import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { MasterWalletType } from '@modules/database/schemas/master-wallet.schema';

export class UpdateMasterWalletBalanceDto {
  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  @IsNotEmpty()
  balance: number;

  @ApiProperty({ type: MasterWalletType, enum: MasterWalletType, required: true })
  @IsOptional()
  @IsEnum(MasterWalletType)
  type: MasterWalletType;
}

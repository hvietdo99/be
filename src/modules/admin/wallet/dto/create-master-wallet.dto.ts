import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { MasterWalletType } from '@modules/database/schemas/master-wallet.schema';

export class CreateMasterWalletDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  prvKey: string;

  @ApiProperty({ type: MasterWalletType, enum: MasterWalletType, required: true })
  @IsOptional()
  @IsEnum(MasterWalletType)
  type: MasterWalletType;
}

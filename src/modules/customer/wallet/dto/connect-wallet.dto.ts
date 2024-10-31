import { WalletType } from '@modules/database/schemas/wallet.schema';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ConnectWalletDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ type: WalletType, enum: WalletType, required: true })
  @IsEnum(WalletType)
  @IsNotEmpty()
  type: WalletType;
}

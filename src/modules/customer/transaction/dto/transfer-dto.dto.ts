import { ApiProperty } from '@nestjs/swagger';
import { Network } from '@src/modules/database/schemas/user.schema';
import { IsNotEmpty, IsPositive } from 'class-validator';

export class TransferDto {
  @ApiProperty({ example: '0x0000000000000000000000000000000000000000' })
  @IsNotEmpty({ message: 'TOKEN_ADDRESS_REQUIRED' })
  token: string;

  @ApiProperty({ example: 'username1' })
  @IsNotEmpty({ message: 'USENAME_REQUIRED' })
  to: string;

  @ApiProperty({ example: 'BSC' })
  @IsNotEmpty({ message: 'NETWORK_REQUIRED' })
  network: Network;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'AMOUNT_REQUIRED' })
  @IsPositive({ message: 'AMOUNT_INVALID' })
  amount: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMasterWalletDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  prvKey: string;
}

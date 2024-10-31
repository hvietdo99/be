import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateVolumeSettingDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
  fee: number;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
  minVolume: number;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
  minRevenue: number;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
  minFnstBalance: number;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
  fnstHoldingValue: number;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
  minFeeAndFnstHolding: number;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
  minRevenueAndFnstHolding: number;
}

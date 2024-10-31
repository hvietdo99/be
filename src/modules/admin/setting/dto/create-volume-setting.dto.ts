import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateVolumeSettingDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  @IsNotEmpty()
  tier: number;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  @IsNotEmpty()
  fee: number;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  @IsNotEmpty()
  minVolume: number;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  @IsNotEmpty()
  minRevenue: number;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  @IsNotEmpty()
  minFnstBalance: number;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  @IsNotEmpty()
  fnstHoldingValue: number;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  @IsNotEmpty()
  minFeeAndFnstHolding: number;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  @IsNotEmpty()
  minRevenueAndFnstHolding: number;
}

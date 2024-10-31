import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AssetStatus } from '@modules/database/schemas/asset.schema';

export class SaveAssetDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  networkLogo: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  currencyLogo: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  mainCurrency: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  network: string;

  @ApiProperty({ type: AssetStatus, enum: AssetStatus, required: false })
  @IsOptional()
  @IsEnum(AssetStatus)
  status: AssetStatus;
}

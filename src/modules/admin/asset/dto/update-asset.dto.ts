import { AssetStatus } from '@modules/database/schemas/asset.schema';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAssetDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  networkLogo: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  currency: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  currencyLogo: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  mainCurrency: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  network: string;

  @ApiProperty({ type: AssetStatus, enum: AssetStatus, required: false })
  @IsEnum(AssetStatus)
  @IsOptional()
  status: AssetStatus;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Lang } from '@common/classes/response.dto';

export class InitSettingDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  currency: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  lang: Lang;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  verification: string;

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  chargeFee: boolean;
}

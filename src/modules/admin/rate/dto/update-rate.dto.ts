import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateRateDto {
  @ApiProperty({ type: Number, required: true, minimum: 0 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  rate: number;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  note?: string;
}

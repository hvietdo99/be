import { ApiProperty } from '@nestjs/swagger';
import { lowerCaseTransformer } from '@src/common/utils/lower-case.transformer';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class Verify2FADto {
  @ApiProperty({ example: '324546' })
  @IsNotEmpty()
  @Transform(lowerCaseTransformer)
  code: string;
}

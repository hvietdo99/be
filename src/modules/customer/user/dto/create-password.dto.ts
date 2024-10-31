import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePasswordDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  password: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  password: string;
}

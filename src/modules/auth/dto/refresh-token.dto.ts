import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { LoginResponseDto } from '@modules/auth/dto/login.dto';

export class RefreshTokenDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class RefreshTokenResponseDto extends LoginResponseDto {}

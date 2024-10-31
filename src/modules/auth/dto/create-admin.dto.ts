import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Gender } from '@modules/database/schemas/user.schema';
import { RegisterResponseDto } from '@modules/auth/dto/register.dto';

export class CreateAdminDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: Date, required: true })
  @IsOptional()
  @IsDateString()
  birthday: Date;

  @ApiProperty({ type: Gender, enum: Gender, required: true })
  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  address: string;
}

export class CreateAdminResponseDto extends RegisterResponseDto {}

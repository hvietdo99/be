import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Gender } from '@modules/database/schemas/user.schema';

export class CreateUserDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  @IsDateString()
  birthday: Date;

  @ApiProperty({ type: Gender, enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  avatar: string;
}

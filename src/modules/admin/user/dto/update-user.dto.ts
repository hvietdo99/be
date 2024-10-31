import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  Gender,
  UserRole,
  UserStatus,
  UserType,
} from '@modules/database/schemas/user.schema';
import { GetUserDetailResponseDto } from '@modules/admin/user/dto/get-user-detail.dto';

export class UpdateUserDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ type: UserRole, enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  password: string;

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  twoFA: boolean;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  prvKey: string;

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  @IsDateString()
  birthday: Date;

  @ApiProperty({ type: Gender, enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ type: UserType, enum: UserType, required: false })
  @IsOptional()
  @IsEnum(UserType)
  type: UserType;

  @ApiProperty({ type: UserStatus, enum: UserStatus, required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status: UserStatus;
}

export class UpdateUserResponseDto extends GetUserDetailResponseDto {}

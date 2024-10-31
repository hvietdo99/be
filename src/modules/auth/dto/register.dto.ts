import {
  Gender,
  User,
  UserRole,
  UserType,
} from '@modules/database/schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class RegisterDto {
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

  @ApiProperty({ type: Date, required: false })
  @IsOptional()
  @IsDateString()
  birthday: Date;

  @ApiProperty({ type: Gender, enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;
}

export class AuthUserInformation {
  _id: string;
  code: string;
  address: string;
  name: string;
  balance: Map<string, number>;
  gender: Gender;
  email: string;
  avatar: string;
  birthday: Date;
  role: UserRole;
  type: UserType;

  constructor(props: any) {
    this._id = props._id.toString();
    this.code = props.code;
    this.address = props.address;
    this.name = props.name;
    this.balance = props.balance;
    this.gender = props.gender;
    this.email = props.email;
    this.avatar = props.avatar;
    this.birthday = props.birthday;
    this.role = props.role;
    this.type = props.type;
  }
}

export class GenerateTokenDto {
  accessToken: string;
  refreshToken: string;

  constructor(props: GenerateTokenDto) {
    this.accessToken = props.accessToken;
    this.refreshToken = props.refreshToken;
  }
}

export class RegisterResponseDto {
  user: AuthUserInformation;
  accessToken: string;
  refreshToken: string;

  constructor(user: AuthUserInformation, props: GenerateTokenDto) {
    this.user = user;
    this.accessToken = props.accessToken;
    this.refreshToken = props.refreshToken;
  }
}

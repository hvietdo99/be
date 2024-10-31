import { RangeDateRequestDto } from '@common/classes/request.dto';
import {
  Gender,
  Network,
  UserDocument,
  UserRole,
  UserStatus,
  UserType,
} from '@modules/database/schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class GetAllUsersDto extends RangeDateRequestDto {
  @ApiProperty({ type: UserType, required: false, enum: UserType })
  @IsOptional()
  @IsEnum(UserType)
  type: UserType;

  @ApiProperty({ type: UserStatus, required: false, enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status: UserStatus;
}

export class GetAllUsersResponseDto {
  _id: string;
  code: string;
  name: string;
  addresses: {
    [Network.BEP20]: string;
    [Network.ERC20]: string;
    [Network.TRC20]: string;
  };
  birthday: Date;
  gender: Gender;
  email: string;
  type: UserType;
  status: UserStatus;
  createdAt: Date;
  balance: Map<string, number>;
  avatar: string;
  role: UserRole;
  twoFA: boolean;

  constructor(props: UserDocument) {
    this._id = props._id.toString();
    this.code = props.code;
    this.name = props.name;
    this.addresses = props.addresses;
    this.birthday = props.birthday;
    this.gender = props.gender;
    this.email = props.email;
    this.type = props.type;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.balance = props.balance;
    this.avatar = props.avatar;
    this.role = props.role;
    this.twoFA = props.twoFA;
  }
}

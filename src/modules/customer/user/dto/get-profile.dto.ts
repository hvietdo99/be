import {
  Gender,
  UserRole,
  UserStatus,
  UserType,
} from '@modules/database/schemas/user.schema';

export class GetProfileResponseDto {
  _id: string;
  name: string;
  code: string;
  email: string;
  address: string;
  balance: Map<string, number>;
  birthday: Date;
  gender: Gender;
  avatar: string;
  role: UserRole;
  type: UserType;
  status: UserStatus;
  twoFA: boolean;

  constructor(props: any) {
    this._id = props._id.toString();
    this.name = props.name;
    this.code = props.code;
    this.email = props.email;
    this.twoFA = props.twoFA;
    this.balance = props.balance;
    this.address = props.address;
    this.birthday = props.birthday;
    this.gender = props.gender;
    this.avatar = props.avatar;
    this.role = props.role;
    this.type = props.type;
    this.status = props.status;
  }
}

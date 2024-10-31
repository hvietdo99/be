import { Gender, UserType } from '@modules/database/schemas/user.schema';

export class GetUserDetailResponseDto {
  _id: string;
  code: string;
  email: string;
  name: string;
  address: string;
  birthday: Date;
  gender: Gender;
  avatar: string;
  type: UserType;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;

  constructor(props: any) {
    this._id = props._id.toString();
    this.code = props.code;
    this.email = props.email;
    this.name = props.name;
    this.address = props.address;
    this.birthday = props.birthday;
    this.gender = props.gender;
    this.avatar = props.avatar;
    this.type = props.type;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }
}

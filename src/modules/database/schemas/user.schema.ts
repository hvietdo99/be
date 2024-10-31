import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CollectionConstants } from '@common/constants/collection.constants';

export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
  SU = 'SU',
}

export enum KYCStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum UserType {
  PERSONAL = 'PERSONAL',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum Network {
  ERC20 = 'ERC20',
  BEP20 = 'BEP20',
  TRC20 = 'TRC20',
}

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: CollectionConstants.USER, timestamps: true })
export class User {
  @Prop({ type: String, unique: true, required: true })
  code: string;

  @Prop({ type: String, unique: true, required: true })
  email: string;

  @Prop({ type: String, unique: true })
  blockpassId?: string;

  @Prop({ type: String, unique: true, sparse: true })
  googleId?: string;

  @Prop({ type: String, required: false })
  password: string;

  @Prop({ type: Object, unique: true, required: true })
  addresses: {
    [Network.BEP20]: string;
    [Network.ERC20]: string;
    [Network.TRC20]: string;
  };

  @Prop({ type: String, unique: true, required: true })
  prvKey: string;

  @Prop({ type: Boolean, required: true, default: false })
  twoFA: boolean;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({
    type: Map,
    of: Number, // Values are numbers representing the balance
    required: true,
    default: {},
  })
  balance: Map<Network, number>;

  @Prop({ type: Number, required: true, default: 0 })
  fiat: number;

  @Prop({ type: Date, required: false })
  birthday: Date;

  @Prop({ type: String, enum: Gender, required: false })
  gender: Gender;

  @Prop({ type: String, required: false })
  avatar: string;

  @Prop({ type: String, enum: UserRole, required: true, default: UserRole.CUSTOMER })
  role: UserRole;

  @Prop({ type: String, enum: UserType, required: true, default: UserType.PERSONAL })
  type: UserType;

  @Prop({
    type: String,
    enum: UserStatus,
    required: true,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Prop({ required: true, enum: KYCStatus, default: KYCStatus.PENDING })
  kycStatus: KYCStatus;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

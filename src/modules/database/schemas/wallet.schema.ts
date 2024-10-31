import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CollectionConstants } from '@common/constants/collection.constants';

export enum WalletType {
  METAMASK = 'METAMASK',
  WALLET_CONNECT = 'WALLET_CONNECT',
  BINANCE_WALLET = 'BINANCE_WALLET',
  COINBASE = 'COINBASE',
  TRUST_WALLET = 'TRUST_WALLET',
}

export type WalletDocument = HydratedDocument<Wallet>;

@Schema({ collection: CollectionConstants.WALLET, timestamps: true })
export class Wallet {
  @Prop({ type: String, enum: WalletType, required: true })
  type: WalletType;

  @Prop({ type: String, unique: true, required: true })
  address: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

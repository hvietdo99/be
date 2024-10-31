import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Network } from './user.schema';

export enum MasterWalletType {
  MASTER_WALLET = 'MASTER_WALLET',
  RESERVE_WALLET = 'RESERVE_WALLET',
}

export type MasterWalletDocument = HydratedDocument<MasterWallet>;

@Schema({ collection: 'master_wallet', timestamps: true })
export class MasterWallet {
  @Prop({ type: Object, unique: true, required: true })
  addresses: {
    [Network.BEP20]: string;
    [Network.ERC20]: string;
    [Network.TRC20]: string;
  };

  @Prop({ type: String, unique: true, required: true })
  prvKey: string;

  @Prop({
    type: Map,
    of: Number, // Values are numbers representing the balance
    required: true,
    default: {},
  })
  balance: Map<Network, number>;

  @Prop({
    type: String,
    enum: MasterWalletType,
    required: true,
    default: MasterWalletType.MASTER_WALLET,
  })
  type: MasterWalletType;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const MasterWalletSchema = SchemaFactory.createForClass(MasterWallet);

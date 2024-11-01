import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Network } from '@modules/database/schemas/user.schema';

export enum OtcOrderType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OtcOrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export type OtcOrderDocument = HydratedDocument<OtcOrder>;

@Schema({ collection: 'otc_orders', timestamps: true })
export class OtcOrder {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: OtcOrderType, required: true })
  type: OtcOrderType;

  @Prop({ type: String, enum: OtcOrderStatus, default: OtcOrderStatus.PENDING })
  status: OtcOrderStatus;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, required: true })
  fiatAmount: number;

  @Prop({ type: String, required: true })
  fiatCurrency: string;

  @Prop({ type: String, enum: Network, required: true })
  network: Network;

  @Prop({ type: Boolean, default: false })
  isPreOrder: boolean;

  @Prop({ type: Date })
  expiresAt: Date;

  @Prop({ type: Boolean, default: false })
  fiatDeposited: boolean;

  @Prop({ type: String })
  transactionId: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const OtcOrderSchema = SchemaFactory.createForClass(OtcOrder);

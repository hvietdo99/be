import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CollectionConstants } from '@common/constants/collection.constants';
import { HydratedDocument } from 'mongoose';

export enum TransactionStatus {
  PROCESS = 'PROCESS',
  SUCCESS = 'SUCCESS',
  CANCELED = 'CANCELED',
  REJECTED = 'REJECTED',
}

export enum TransactionType {
  WITHDRAW = 'WITHDRAW',
  DEPOSIT = 'DEPOSIT',
  TRANSFER = 'TRANSFER',
  FIAT_DEPOSIT = 'FIAT_DEPOSIT',
}

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ collection: CollectionConstants.TRANSACTION, timestamps: true })
export class Transaction {
  @Prop({ type: String, unique: true, required: true })
  tx: string;

  @Prop({ type: String, required: true })
  fromAddress: string;

  @Prop({ type: String, required: false })
  toAddress: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: Number, required: false })
  price: number;

  @Prop({ type: Number, required: false })
  closedPrice: number;

  @Prop({ type: String, required: false })
  paymentMethod: string;

  @Prop({ type: String, required: false })
  network: string;

  @Prop({
    type: String,
    enum: TransactionStatus,
    required: true,
    default: TransactionStatus.PROCESS,
  })
  status: TransactionStatus;

  @Prop({
    type: String,
    enum: TransactionType,
    required: true,
  })
  type: TransactionType;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

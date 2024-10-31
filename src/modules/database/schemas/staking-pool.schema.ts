import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum StakingPoolStatus {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum DurationType {
  SIX_MONTH = 'SIX_MONTH',
  TWELVE_MONTH = 'TWELVE_MONTH',
  TWENTY_FOUR_MONTH = 'TWENTY_FOUR_MONTH',
  THIRTY_SIX_MONTH = 'THIRTY_SIX_MONTH',
}

export type StakingPoolDocument = HydratedDocument<StakingPool>;

@Schema()
export class Duration {
  @Prop({ type: String, enum: DurationType, required: true })
  type: DurationType;

  @Prop({ type: Number, required: true })
  profit: number;
}

@Schema({ collection: 'staking_pool', timestamps: true })
export class StakingPool {
  @Prop({ type: String, required: false })
  internalId: string;

  @Prop({ type: String, required: false })
  address: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creator: Types.ObjectId;

  @Prop({ type: String, required: true })
  poolLogo: string;

  @Prop({ type: String, required: false })
  rewardCurrency: string;

  @Prop({ type: String, required: false })
  depositCurrency: string;

  @Prop({ type: String, required: false })
  network: string;

  @Prop({ type: String, required: false })
  name: string;

  @Prop({
    type: String,
    enum: StakingPoolStatus,
    required: true,
    default: StakingPoolStatus.PRIVATE,
  })
  status: StakingPoolStatus;

  @Prop({ type: [Duration], required: true })
  duration: Duration[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const StakingPoolSchema = SchemaFactory.createForClass(StakingPool);

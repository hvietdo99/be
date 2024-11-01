import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UsdtRateDocument = HydratedDocument<UsdtRate>;

@Schema({ collection: 'usdt_rates', timestamps: true })
export class UsdtRate {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  updatedBy: Types.ObjectId;

  @Prop({ type: Number, required: true })
  rate: number;

  @Prop({ type: String })
  note: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UsdtRateSchema = SchemaFactory.createForClass(UsdtRate);

// Index for efficient queries
UsdtRateSchema.index({ createdAt: -1 });

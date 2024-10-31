import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type VolumeSettingDocument = HydratedDocument<VolumeSetting>;

@Schema({ collection: 'volume_setting', timestamps: true })
export class VolumeSetting {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true })
  tier: number;

  @Prop({ type: Number, required: true })
  fee: number;

  @Prop({ type: Number, required: true })
  minVolume: number;

  @Prop({ type: Number, required: true })
  minRevenue: number;

  @Prop({ type: Number, required: true })
  minFnstBalance: number;

  @Prop({ type: Number, required: true })
  fnstHoldingValue: number;

  @Prop({ type: Number, required: true })
  minFeeAndFnstHolding: number;

  @Prop({ type: Number, required: true })
  minRevenueAndFnstHolding: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const VolumeSettingSchema = SchemaFactory.createForClass(VolumeSetting);

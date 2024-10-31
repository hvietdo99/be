import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Lang } from '@common/classes/response.dto';
import { AppConstants } from '@common/constants/app.constants';
import { HydratedDocument, Types } from 'mongoose';

export type SettingDocument = HydratedDocument<Setting>;

@Schema({ collection: 'setting', timestamps: true })
export class Setting {
  @Prop({ type: String, required: true, default: AppConstants.DEFAULT_CURRENCY })
  currency: string;

  @Prop({
    type: String,
    enum: Lang,
    required: true,
    default: Lang.EN,
  })
  lang: Lang;

  @Prop({ type: String, required: false })
  verification: string;

  @Prop({ type: Boolean, required: true, default: false })
  chargeFee: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);

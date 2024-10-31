import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CollectionConstants } from '@common/constants/collection.constants';

export enum AssetStatus {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export type AssetDocument = HydratedDocument<Asset>;

@Schema({ collection: CollectionConstants.ASSET, timestamps: true })
export class Asset {
  @Prop({ type: String, unique: true, required: true })
  address: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creator: Types.ObjectId;

  @Prop({ type: String, required: false })
  name: string;

  @Prop({
    type: String,
    enum: AssetStatus,
    required: true,
    default: AssetStatus.PUBLIC,
  })
  status: AssetStatus;

  @Prop({ type: String, required: true })
  currency: string;

  @Prop({ type: String, required: true })
  currencyLogo: string;

  @Prop({ type: String, required: true })
  mainCurrency: string;

  @Prop({ type: String, required: true })
  network: string;

  @Prop({ type: String, required: true })
  networkLogo: string;

  @Prop({ type: String, required: false })
  internalId: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);

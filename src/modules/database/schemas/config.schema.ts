import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ConfigDocument = HydratedDocument<Config>;

@Schema({ collection: 'config', timestamps: true })
export class Config {
  @Prop({ type: Number, required: true, default: 1 }) // %
  withdrawFee: number;

  @Prop()
  createdAt: Date;
}

export const ConfigSchema = SchemaFactory.createForClass(Config);

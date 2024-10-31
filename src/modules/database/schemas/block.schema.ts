import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Network } from './user.schema';

export type BlockDocument = HydratedDocument<Block>;

@Schema({ collection: 'block', timestamps: true })
export class Block {
  @Prop({ type: Number, required: true, default: 0 })
  lastScanBlock: number;

  @Prop({ type: String, enum: Network, unique: true, required: true })
  network: Network;

  @Prop()
  createdAt: Date;
}

export const BlockSchema = SchemaFactory.createForClass(Block);

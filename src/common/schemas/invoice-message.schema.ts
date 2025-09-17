// message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true, collection: 'msgs' })
export class Message {
  @Prop({ type: Types.ObjectId, required: true })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'chats', required: true })
  chatId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'users', required: true })
  senderId: Types.ObjectId;

  @Prop()
  senderName: string;

  @Prop({ required: true })
  text: string;

  @Prop({ type: [Types.ObjectId], ref: 'users', default: [] })
  readBy?: Types.ObjectId[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ chatId: 1, createdAt: 1 });

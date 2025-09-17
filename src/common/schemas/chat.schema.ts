// chat.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true, collection: 'chats' })
export class Chat {
  @Prop({ type: [Types.ObjectId], ref: 'User', required: true })
  participants: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Inquiry', required: true })
  invoiceId: Types.ObjectId;

  @Prop({ type: String })
  lastMessage?: string;

  @Prop({ type: Date })
  lastMessageAt?: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

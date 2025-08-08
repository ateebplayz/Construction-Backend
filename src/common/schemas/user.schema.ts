import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ collection: 'users' })
export class User {
  @Prop({ required: true, type: Types.ObjectId })
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  level: number; // 1 for Admin, 0 for Employee
}

export const UserSchema = SchemaFactory.createForClass(User);

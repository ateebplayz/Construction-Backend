import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LocationDto } from '../dto/clock.dto';

class Client {
  name: string;
  phone: string;
  address: string;
}

export class AdminRemark {
  content: string;
  added: Date;
}

export type InquiryDocument = Inquiry & Document;

@Schema({ timestamps: true, collection: 'inquiries' })
export class Inquiry {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employee: Types.ObjectId;

  @Prop({ required: true, type: LocationDto })
  location: LocationDto;

  @Prop()
  remarks: string;

  @Prop([String])
  photoUrls: string[];

  @Prop({ type: Client })
  client: Client;

  @Prop({ default: 'pending' })
  status: 'pending' | 'approved' | 'denied' | 'followup';

  @Prop({ type: [AdminRemark] })
  adminRemarks: Array<AdminRemark>;

  @Prop({ type: Date, index: true })
  followUpDate: Date;

  @Prop({ type: Boolean, default: false })
  readyMix: boolean;

  @Prop({ type: Boolean, default: false })
  blocks: boolean;

  @Prop({ type: Boolean, default: false })
  buildingMaterial: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const InquirySchema = SchemaFactory.createForClass(Inquiry);

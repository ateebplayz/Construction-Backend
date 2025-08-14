import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LocationDto } from '../dto/clock.dto';

export type ClockLogDocument = ClockLog & Document;

@Schema({ timestamps: true })
export class ClockLog {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employee: Types.ObjectId;

  @Prop({ required: true })
  action: 'clock_in' | 'clock_out' | 'break' | 'resume';

  @Prop({ type: LocationDto })
  location?: LocationDto;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const ClockLogSchema = SchemaFactory.createForClass(ClockLog);

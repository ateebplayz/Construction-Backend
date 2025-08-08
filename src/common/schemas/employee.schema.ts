import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LocationDto } from '../dto/clock.dto';

export type EmployeeDocument = Employee & Document;

@Schema({ timestamps: true, collection: 'employees' })
export class Employee {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  @Prop({ default: 'clocked_out' })
  status: 'clocked_out' | 'clocked_in' | 'on_break';

  @Prop({ type: LocationDto })
  currentLocation: LocationDto;

  @Prop({ type: Date })
  lastClockInTime: Date;

  @Prop({ type: Date })
  lastClockOutTime: Date;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

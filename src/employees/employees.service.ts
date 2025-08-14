import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Employee, EmployeeDocument } from '../common/schemas/employee.schema';
import { Model, Types } from 'mongoose';
import { Inquiry, InquiryDocument } from '../common/schemas/inquiry.schema';
import {
  InquiryDto,
  ResolveInquiryDto,
  UpdateInquiryDto,
} from '../common/dto/inquiry.dto';
import { LocationDto } from '../common/dto/clock.dto';
import { r2PublicUrl } from '../config';
import { Counter, CounterDocument } from '../common/schemas/counter.schema';
import { ClockLog, ClockLogDocument } from '../common/schemas/clock-log.schema';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(Inquiry.name) private inquiryModel: Model<InquiryDocument>,
    @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
    @InjectModel(ClockLog.name) private clockLogModel: Model<ClockLogDocument>,
  ) {}

  async getEmployeeById(id: string) {
    return this.employeeModel.findById(id);
  }

  private async logAction(
    userId: string,
    action: ClockLog['action'],
    location?: LocationDto,
  ) {
    await this.clockLogModel.create({
      employee: new Types.ObjectId(userId),
      action,
      location,
      timestamp: new Date(),
    });
  }

  async clockIn(userId: string, location: LocationDto) {
    await this.logAction(userId, 'clock_in', location);

    return this.employeeModel.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      {
        $set: {
          status: 'clocked_in',
          currentLocation: location,
          lastClockInTime: new Date(),
        },
      },
      { new: true },
    );
  }

  async clockOut(userId: string) {
    await this.logAction(userId, 'clock_out');
    return this.employeeModel.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      {
        $set: {
          status: 'clocked_out',
          lastClockOutTime: new Date(),
        },
      },
      { new: true },
    );
  }

  async startBreak(userId: string) {
    await this.logAction(userId, 'break');
    return this.employeeModel.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      {
        $set: {
          status: 'on_break',
        },
      },
      { new: true },
    );
  }

  async resumeWork(userId: string) {
    await this.logAction(userId, 'resume');
    return this.employeeModel.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      {
        $set: {
          status: 'clocked_in',
        },
      },
      { new: true },
    );
  }

  async getEmployeeLogs(employeeId: string) {
    return this.clockLogModel
      .find({ employee: new Types.ObjectId(employeeId) })
      .sort({ timestamp: -1 });
  }

  async getNextSequence(name: string): Promise<number> {
    const counter = await this.counterModel.findOneAndUpdate(
      { name },
      { $inc: { value: 1 } },
      { new: true, upsert: true },
    );
    return counter.value;
  }

  async submitInquiry(userId: string, dto: InquiryDto) {
    const inquiryNumber = await this.getNextSequence('inquiryNumber');

    return this.inquiryModel.create({
      inquiryNumber,
      employee: userId,
      location: dto.location,
      remarks: dto.remarks,
      photoUrls: dto.photoUrls,
      client: dto.client,
      followUpDate: dto.followUpDate,
      readyMix: dto.readyMix,
      blocks: dto.blocks,
      buildingMaterial: dto.buildingMaterial,
    });
  }

  async updateLocation(userId: string, location: LocationDto) {
    return this.employeeModel.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      {
        $set: { currentLocation: location, updatedAt: new Date() },
      },
      { new: true },
    );
  }

  async getUsers(): Promise<EmployeeDocument[]> {
    return this.employeeModel.find();
  }

  async getInquiries(): Promise<Inquiry[]> {
    const inquiries = await this.inquiryModel.find();

    return inquiries.map((inquiry) => {
      const modifiedInquiry = inquiry.toObject(); // convert Mongoose document to plain JS object
      modifiedInquiry.photoUrls = modifiedInquiry.photoUrls.map(
        (key: string) => `${r2PublicUrl}/${key}`,
      );
      return modifiedInquiry;
    });
  }

  async getAlerts(): Promise<Inquiry[]> {
    const now = new Date();

    const inquiries = await this.inquiryModel.find({
      $and: [
        {
          $or: [
            { blocks: false },
            { readyMix: false },
            { buildingMaterial: false },
            { followUpDate: { $lt: now } },
          ],
        },
        { status: { $ne: 'completed' } },
      ],
    });

    return inquiries.map((inquiry) => {
      const modifiedInquiry = inquiry.toObject();
      modifiedInquiry.photoUrls = modifiedInquiry.photoUrls.map(
        (key: string) => `${r2PublicUrl}/${key}`,
      );
      return modifiedInquiry;
    });
  }

  async updateInquiry(id: string, dto: UpdateInquiryDto) {
    return this.inquiryModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async resolveInquiry(id: string, dto: ResolveInquiryDto) {
    return this.inquiryModel.findByIdAndUpdate(id, dto, { new: true });
  }
}

import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Employee, EmployeeDocument } from '../common/schemas/employee.schema';
import { Model, Types } from 'mongoose';
import { Inquiry, InquiryDocument } from '../common/schemas/inquiry.schema';
import { InquiryDto, UpdateInquiryDto } from '../common/dto/inquiry.dto';
import { LocationDto } from '../common/dto/clock.dto';
import { r2PublicUrl } from '../config';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(Inquiry.name) private inquiryModel: Model<InquiryDocument>,
  ) {}

  async getEmployeeById(id: string) {
    return this.employeeModel.findById(id);
  }

  async clockIn(userId: string, location: any) {
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

  async submitInquiry(userId: string, dto: InquiryDto) {
    return this.inquiryModel.create({
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

  async updateInquiry(id: string, dto: UpdateInquiryDto) {
    return this.inquiryModel.findByIdAndUpdate(id, dto, { new: true });
  }
}

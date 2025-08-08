import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../common/schemas/user.schema';
import { employeeLevel } from '../config';
import { Employee, EmployeeDocument } from '../common/schemas/employee.schema';
import { UpdateDto } from '../common/dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    private jwtService: JwtService,
  ) {}

  async register(username: string, password: string, level: number) {
    const userOid = new Types.ObjectId();

    const user = new this.userModel({
      _id: userOid,
      username,
      password,
      level,
    });

    if (level == employeeLevel) {
      const employee = new this.employeeModel({
        _id: new Types.ObjectId(),
        user: userOid,
        status: 'clocked_out',
        currentLocation: {
          lat: 0,
          lng: 0,
        },
        lastClockInTime: new Date(),
        lastClockOutTime: new Date(),
      });
      await employee.save();
    }
    return user.save();
  }

  async updateUser(userUpdate: UpdateDto, user: User) {
    if (userUpdate.username) {
      const userUsername = await this.getUserByUsername(userUpdate.username);
      if (userUsername && userUpdate.username !== user.username)
        throw new BadRequestException('Username already in use');
    }
    return this.userModel.updateOne(
      {
        _id: new Types.ObjectId(userUpdate.id),
      },
      {
        $set: {
          username: userUpdate.username || user.username,
          password: userUpdate.password || user.password,
        },
      },
    );
  }

  async deleteUser(userId: string, user: User) {
    if (user.level == 0) await this.employeeModel.deleteOne({ user: user._id });
    return this.userModel.deleteOne({ _id: new Types.ObjectId(userId) });
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ username });
    if (user && user.password == password) {
      return user;
    }
    return null;
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userModel.findOne({ _id: new Types.ObjectId(id) });
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return await this.userModel.findOne({ username });
  }

  login(user: User) {
    const payload = { sub: user._id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
      level: user.level,
    };
  }

  async getUsers(): Promise<Array<User>> {
    return await this.userModel.find();
  }
}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { jwtKey } from '../config';
import { JwtStrategy } from '../common/strategies/jwt.strategy';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { Employee, EmployeeSchema } from '../common/schemas/employee.schema';
import { Inquiry, InquirySchema } from '../common/schemas/inquiry.schema';
import { R2Module } from '../r2/r2.module';
import { AuthModule } from '../auth/auth.module';
import { Counter, CounterSchema } from '../common/schemas/counter.schema';
import { ClockLog, ClockLogSchema } from '../common/schemas/clock-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
    ]),
    MongooseModule.forFeature([{ name: Inquiry.name, schema: InquirySchema }]),
    MongooseModule.forFeature([{ name: Counter.name, schema: CounterSchema }]),
    MongooseModule.forFeature([
      { name: ClockLog.name, schema: ClockLogSchema },
    ]),
    JwtModule.register({
      secret: jwtKey,
    }),
    R2Module,
    AuthModule,
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService, JwtStrategy],
})
export class EmployeesModule {}

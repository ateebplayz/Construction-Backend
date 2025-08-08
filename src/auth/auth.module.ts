import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../common/schemas/user.schema';
import { JwtStrategy } from '../common/strategies/jwt.strategy';
import { jwtKey } from '../config';
import { Employee, EmployeeSchema } from '../common/schemas/employee.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
    ]),
    JwtModule.register({
      secret: jwtKey,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

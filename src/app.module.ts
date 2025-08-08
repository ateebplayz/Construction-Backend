import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { mongoUrl } from './config';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { R2Service } from './r2/r2.service';
import { R2Module } from './r2/r2.module';

@Module({
  imports: [
    MongooseModule.forRoot(mongoUrl, {
      dbName: 'dev',
    }),
    AuthModule,
    EmployeesModule,
    R2Module,
  ],
  controllers: [AppController],
  providers: [AppService, R2Service],
})
export class AppModule {}

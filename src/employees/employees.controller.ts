import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Patch,
  UnauthorizedException,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-guard.guard';
import { ClockDto, LocationDto } from '../common/dto/clock.dto';
import {
  InquiryDto,
  ResolveInquiryDto,
  UpdateInquiryDto,
} from '../common/dto/inquiry.dto';
import { EmployeesService } from './employees.service';
import { RequestWithUser } from '../common/types/req.types';
import { UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../common/utils/multer.util';
import { R2Service } from '../r2/r2.service';
import { adminLevel } from '../config';
import { AuthService } from '../auth/auth.service';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly r2Service: R2Service,
    private readonly authService: AuthService,
  ) {}

  @Post('clock-in')
  clockIn(@Req() req: RequestWithUser, @Body() dto: ClockDto) {
    return this.employeesService.clockIn(req.user.userId, dto.location);
  }

  @Post('clock-out')
  clockOut(@Req() req: RequestWithUser) {
    return this.employeesService.clockOut(req.user.userId);
  }

  @Post('break')
  startBreak(@Req() req: RequestWithUser) {
    return this.employeesService.startBreak(req.user.userId);
  }

  @Post('resume')
  resumeWork(@Req() req: RequestWithUser) {
    return this.employeesService.resumeWork(req.user.userId);
  }

  @Post('inquiry')
  @UseInterceptors(FilesInterceptor('photos', 5, multerOptions))
  async submitInquiry(
    @Req() req: RequestWithUser,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: Record<string, string>,
  ) {
    const location = JSON.parse(body.location) as InquiryDto['location'];
    const client = JSON.parse(body.client) as InquiryDto['client'];
    const remarks: string = body.remarks;

    const followUpDate = body.followUpDate;
    const readyMix = body.readyMix === 'true';
    const blocks = body.blocks === 'true';
    const buildingMaterial = body.buildingMaterial === 'true';

    const urls = await Promise.all(
      files.map((file) => this.r2Service.uploadFile(file)),
    );

    const dto: InquiryDto = {
      location,
      client,
      remarks,
      photoUrls: urls,
      followUpDate,
      readyMix,
      blocks,
      buildingMaterial,
    };

    return this.employeesService.submitInquiry(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/inquiry/all')
  async getInquiries(@Req() req: RequestWithUser) {
    const user = await this.authService.getUserById(req.user.userId);
    if (!user || user.level !== adminLevel)
      throw new UnauthorizedException('This is not an admin account');
    return this.employeesService.getInquiries();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/inquiry/alerts')
  async getAlerts(@Req() req: RequestWithUser) {
    const user = await this.authService.getUserById(req.user.userId);
    if (!user || user.level !== adminLevel)
      throw new UnauthorizedException('This is not an admin account');
    return this.employeesService.getAlerts();
  }

  @Get('profile')
  getProfile(@Req() req: RequestWithUser) {
    return this.employeesService.getEmployeeById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('location')
  async updateLocation(@Req() req: RequestWithUser, @Body() dto: LocationDto) {
    return await this.employeesService.updateLocation(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/all')
  async getUsers(@Req() req: RequestWithUser) {
    const user = await this.authService.getUserById(req.user.userId);
    if (!user || user.level !== adminLevel)
      throw new UnauthorizedException('This is not an admin account');
    return this.employeesService.getUsers();
  }

  @Patch('/inquiry/:id')
  async updateInquiry(@Param('id') id: string, @Body() dto: UpdateInquiryDto) {
    return this.employeesService.updateInquiry(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/inquiry/:id/resolve')
  async resolveInquiry(
    @Param('id') id: string,
    @Body() dto: ResolveInquiryDto,
  ) {
    return this.employeesService.resolveInquiry(id, dto);
  }
}

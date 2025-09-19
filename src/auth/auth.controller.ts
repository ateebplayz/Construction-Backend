import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Req,
  UnauthorizedException,
  BadRequestException,
  Delete,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, UpdateDto } from '../common/dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-guard.guard';
import { RequestWithUser } from '../common/types/req.types';
import { adminLevel } from '../config';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Post('register')
  async register(@Req() req: RequestWithUser, @Body() dto: RegisterDto) {
    const user = await this.authService.getUserById(req.user.userId);
    if (!user || user.level !== adminLevel)
      throw new UnauthorizedException('This is not an admin account');
    const userByUsername = await this.authService.getUserByUsername(
      dto.username,
    );
    if (userByUsername) throw new BadRequestException('User already exists');
    return this.authService.register(dto.username, dto.password, dto.level);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  async updateUser(@Req() req: RequestWithUser, @Body() dto: UpdateDto) {
    const user = await this.authService.getUserById(req.user.userId);
    if (!user || user.level !== adminLevel)
      throw new UnauthorizedException('This is not an admin account');
    const userIded = await this.authService.getUserById(dto.id);
    if (!userIded) throw new UnauthorizedException('User not found');
    return this.authService.updateUser(dto, userIded);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':userId')
  async deleteUser(@Req() req: RequestWithUser, @Param('userId') userId: any) {
    if (!userId || typeof userId !== 'string')
      throw new BadRequestException('Invalid user id');
    const user = await this.authService.getUserById(req.user.userId);
    if (!user || user.level !== adminLevel)
      throw new UnauthorizedException('This is not an admin account');
    const userIded = await this.authService.getUserById(userId);
    if (!userIded) throw new UnauthorizedException('User not found');
    return this.authService.deleteUser(userId, userIded);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(
      dto.username,
      dto.password,
    );
    if (!user) throw new UnauthorizedException('Invalid Credentials');
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: RequestWithUser) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  getUser(@Req() req: RequestWithUser) {
    return this.authService.getUserById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/users/all')
  async getUsers(@Req() req: RequestWithUser) {
    const user = await this.authService.getUserById(req.user.userId);
    if (!user || user.level !== adminLevel)
      throw new UnauthorizedException('This is not an admin account');
    return this.authService.getUsers();
  }
}

import { LocationDto } from './clock.dto';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AdminRemark } from '../schemas/inquiry.schema';

class ClientInfoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;
}

export class InquiryDto {
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsString()
  @IsNotEmpty()
  remarks: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  photoUrls: string[];

  @ValidateNested()
  @Type(() => ClientInfoDto)
  client: ClientInfoDto;

  @IsDateString()
  followUpDate: string;

  @IsOptional()
  @IsBoolean()
  readyMix?: boolean;

  @IsOptional()
  @IsBoolean()
  blocks?: boolean;

  @IsOptional()
  @IsBoolean()
  buildingMaterial?: boolean;
}

export class UpdateInquiryDto {
  @IsOptional()
  @IsIn(['pending', 'in_progress', 'completed', 'rejected'])
  status?: 'pending' | 'in_progress' | 'completed' | 'rejected';

  @IsOptional()
  adminRemarks?: Array<AdminRemark>;
}

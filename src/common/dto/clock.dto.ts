import { IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LocationDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class ClockDto {
  @ValidateNested()
  @Type(() => LocationDto)
  @IsObject()
  location: LocationDto;
}

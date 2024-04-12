import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocationDto } from './location.dto';

export class CreatePropertyDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsString()
  description: string;
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsNotEmpty()
  @IsNumber()
  pricePerNight: Number;
  @IsNotEmpty()
  @IsNumber()
  maxGuests: Number;
  @IsNotEmpty()
  @IsNumber()
  bedrooms: Number;
  @IsNotEmpty()
  @IsNumber()
  bathrooms: Number;
  @IsNotEmpty()
  @IsNumber()
  size: Number;
  @IsArray()
  @IsString({ each: true })
  amenities: string[];
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
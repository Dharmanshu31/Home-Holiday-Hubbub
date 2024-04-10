import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Location } from '../schemas/property.schema';
import { Type } from 'class-transformer';

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
  @ValidateNested()
  @IsObject()
  @Type(() => Location)
  location: Location;
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

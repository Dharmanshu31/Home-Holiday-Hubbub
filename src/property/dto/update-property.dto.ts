import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Location } from '../schemas/property.schema';
import { Type } from 'class-transformer';

export class UpdatePropertyDto {
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

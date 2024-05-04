import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
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
  highlight: string;
  @IsNotEmpty()
  @IsString()
  highlightDetail: string;
  @IsNotEmpty()
  @IsString()
  propertyCategory: string;
  @IsNotEmpty()
  @IsString()
  propertyType: string;
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsNotEmpty()
  @IsNumber()
  pricePerNight: number;
  @IsNotEmpty()
  @IsNumber()
  maxGuests: number;
  @IsNotEmpty()
  @IsNumber()
  bedrooms: number;
  @IsNotEmpty()
  @IsNumber()
  bathrooms: number;
  @IsNotEmpty()
  @IsNumber()
  bed: number;
  @IsArray()
  @IsString({ each: true })
  amenities: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

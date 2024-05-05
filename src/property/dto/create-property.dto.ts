import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
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

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  pricePerNight: number;
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  maxGuests: number;
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  bedrooms: number;
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  bathrooms: number;
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
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

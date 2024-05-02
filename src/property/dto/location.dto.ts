import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class LocationDto {
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  coordinates: number[];

  @IsNotEmpty()
  @IsString()
  formattedAddress: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  zipcode: string;

  @IsNotEmpty()
  @IsString()
  country: string;
}

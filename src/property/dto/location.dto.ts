import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class LocationDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value) && value.length > 0 && !isNaN(parseFloat(value[0]))) {
      return value.map(parseFloat);
    } else {
      return value;
    }
  })
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

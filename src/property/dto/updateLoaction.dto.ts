import { OmitType, PartialType } from '@nestjs/mapped-types';
import { LocationDto } from './location.dto';

export class UpdateLocationDto extends OmitType(PartialType(LocationDto), [
  'coordinates',
]) {}

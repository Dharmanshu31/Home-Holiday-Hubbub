import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreatePropertyDto } from './create-property.dto';
import { UpdateLocationDto } from './updateLoaction.dto';

export class UpdatePropertyDto extends OmitType(PartialType(CreatePropertyDto), [
  'location',
]) {
  location: UpdateLocationDto;
}

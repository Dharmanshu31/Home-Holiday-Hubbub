import { Body, Controller, Get, Post } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { Property } from './schemas/property.schema';

@Controller('property')
export class PropertyController {
  constructor(private propertyService: PropertyService) {}
  @Post()
  createProperty(@Body() property: CreatePropertyDto): Promise<Property> {
    return this.propertyService.createProperty(property);
  }
}

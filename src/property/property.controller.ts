import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { Property } from './schemas/property.schema';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Query as ExpressQuery } from 'express-serve-static-core';

@Controller('property')
export class PropertyController {
  constructor(private propertyService: PropertyService) {}

  @Get()
  async getAllProperty(
    @Query() query: ExpressQuery,
  ): Promise<{ result: number; properties: Property[] }> {
    const properties = await this.propertyService.getAllproperty(query);
    return { result: properties.length, properties };
  }

  @Get(':id')
  getOneProperty(@Param('id') id: string): Promise<Property> {
    return this.propertyService.getOneProperty(id);
  }

  @Get('near-me/distance/:latlag/unit/:unit')
  getNearMe(
    @Param('latlag') latlag: string,
    @Param('unit') unit: string,
  ): Promise<{}> {
    return this.propertyService.getNearMe(latlag, unit);
  }
  @Post()
  createProperty(@Body() property: CreatePropertyDto): Promise<Property> {
    return this.propertyService.createProperty(property);
  }

  @Patch(':id')
  updateProperty(
    @Param('id') id: string,
    @Body() updateDto: UpdatePropertyDto,
  ): Promise<Property> {
    return this.propertyService.updateProperty(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(204)
  deleteProperty(@Param('id') id: string): void {
    this.propertyService.deleteProperty(id);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Property } from './schemas/property.schema';
import { Model } from 'mongoose';
import { CreatePropertyDto } from './dto/create-property.dto';

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name) private propertyModel = Model<Property>,
  ) {}

  async createProperty(property: CreatePropertyDto): Promise<Property> {
    const newProperty = await this.propertyModel.create(property);
    return newProperty;
  }
}

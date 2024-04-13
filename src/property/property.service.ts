import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Property } from './schemas/property.schema';
import { Model } from 'mongoose';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Query } from 'express-serve-static-core';
import { Request } from 'express';
const axios = require('axios');

@Injectable()
export class PropertyService {
  constructor(@InjectModel(Property.name) private propertyModel = Model<Property>) {}

  async createProperty(property: CreatePropertyDto, req: Request): Promise<Property> {
    const propertyObj = { ...property, owner: req.user['_id'] };
    const newProperty = await this.propertyModel.create(propertyObj);
    return newProperty;
  }

  async getAllproperty(query: Query): Promise<Property[]> {
    let filter: {} = {};
    const newQuery: {} = { ...query };
    const notAllowField: string[] = ['page', 'sort', 'limit', 'fields'];
    notAllowField.forEach((el): boolean => delete newQuery[el]);
    let queryStr: string = JSON.stringify(newQuery);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match): string => `$${match}`);
    filter = JSON.parse(queryStr);
    if (query.keyword) {
      filter = { name: { $regex: query.keyword, $options: 'i' } };
    }

    let que = this.propertyModel.find(filter);

    if (query.sort) {
      const sortBy = (query.sort as string).split(',').join(' ');
      que = que.sort(sortBy);
    } else {
      que = que.sort('-createdAt');
    }
    if (query.fields) {
      const fields = (query.fields as string).split(',').join(' ');
      que = que.select(fields);
    } else {
      que = que.select('-__v');
    }
    if (query.page) {
      const page = +query.page;
      const limit = +query.limit;
      const skip = (page - 1) * limit;
      que = que.skip(skip).limit(limit);
    }
    const properties = await que;
    return properties;
  }

  async getOneProperty(id: string): Promise<Property> {
    const property = await this.propertyModel
      .findById(id)
      .populate({ path: 'reviews', select: '-__v' });
    return property;
  }

  async updateProperty(id: string, updateDto: UpdatePropertyDto): Promise<Property> {
    const property = await this.propertyModel.findByIdAndUpdate(id, updateDto, {
      new: true,
      runValidators: true,
    });
    return property;
  }

  async deleteProperty(id: string): Promise<Property> {
    return await this.propertyModel.findByIdAndDelete(id);
  }

  async getNearMe(latlag: string, unit: string): Promise<{}> {
    const [lat, lag]: string[] = latlag.split(',');
    const multipiler: number = unit === 'km' ? 0.001 : 0.000621371;
    const data = await axios.get(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lag}&localityLanguage=en`,
    );
    const city: string = data.data.city;
    const nearProperty = await this.propertyModel.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [+lag, +lat],
          },
          distanceField: 'distance',
          distanceMultiplier: multipiler,
        },
      },
      {
        $match: { 'location.city': city },
      },
      {
        $project: {
          distance: 1,
          name: 1,
          'location.city': 1,
        },
      },
    ]);
    return nearProperty;
  }
}

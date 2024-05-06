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
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { Property } from './schemas/property.schema';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { PropertyValidationInterceptor } from './interceptor/property-validation.interceptor';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';

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
  @UseInterceptors(PropertyValidationInterceptor)
  getOneProperty(@Param('id') id: string): Promise<Property> {
    return this.propertyService.getOneProperty(id);
  }

  @Get('near-me/distance/:latlag/unit/:unit')
  getNearMe(@Param('latlag') latlag: string, @Param('unit') unit: string): Promise<{}> {
    return this.propertyService.getNearMe(latlag, unit);
  }
  @Post()
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles('admin', 'landlord')
  @UseInterceptors(FilesInterceptor('images', 10))
  createProperty(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() property: CreatePropertyDto,
    @Req() req: Request,
  ): Promise<Property> {
    return this.propertyService.createProperty(property, req, files);
  }

  @Patch(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles('admin', 'landlord')
  @UseInterceptors(FilesInterceptor('images', 5))
  @UseInterceptors(PropertyValidationInterceptor)
  updateProperty(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('id') id: string,
    @Body() updateDto: UpdatePropertyDto,
  ): Promise<Property> {
    return this.propertyService.updateProperty(id, updateDto, files);
  }

  @Delete(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles('admin', 'landlord')
  @UseInterceptors(PropertyValidationInterceptor)
  @HttpCode(204)
  deleteProperty(@Param('id') id: string): void {
    this.propertyService.deleteProperty(id);
  }
}

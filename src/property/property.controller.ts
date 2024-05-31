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
import { GeminiAIDto } from './dto/gemini.dto';

@Controller('property')
export class PropertyController {
  constructor(private propertyService: PropertyService) {}

  @Get()
  async getAllProperty(
    @Query() query: ExpressQuery,
  ): Promise<{ properties: Property[]; total: number }> {
    const properties = await this.propertyService.getAllproperty(query);
    return properties;
  }

  @Get(':id')
  @UseInterceptors(PropertyValidationInterceptor)
  getOneProperty(@Param('id') id: string): Promise<Property> {
    return this.propertyService.getOneProperty(id);
  }

  @Get('near-me/distance/:latlag/unit/:unit')
  getNearMe(
    @Param('latlag') latlag: string,
    @Param('unit') unit: string,
    @Query() query: ExpressQuery,
  ): Promise<{}> {
    return this.propertyService.getNearMe(latlag, unit, query);
  }

  @Get('near-me/distance/:distance/:latlag/')
  getByDistance(
    @Param('latlag') latlag: string,
    @Param('distance') distance: string,
    @Query() query: ExpressQuery,
  ): Promise<{}> {
    return this.propertyService.getByDistance(latlag, distance, query);
  }

  @Post()
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles('admin', 'landlord')
  @UseInterceptors(FilesInterceptor('images', 25))
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
  @UseInterceptors(FilesInterceptor('images', 25))
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
  deleteProperty(@Param('id') id: string): Promise<string> {
    return this.propertyService.deleteProperty(id);
  }

  //admin
  @Get('admin/numberOfProperty')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles('admin')
  numberOfProperty(): Promise<number> {
    return this.propertyService.numberOfProperty();
  }

  //collect data on base of user propmt
  @Post('/user/userSpecific')
  getUserSpecificProperty(@Body() geminiAiDto:GeminiAIDto){
    return this.propertyService.getUserSpecificProperty(geminiAiDto)
  }
}

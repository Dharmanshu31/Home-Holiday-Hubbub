import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  NotFoundException,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Property } from '../schemas/property.schema';

@Injectable()
export class PropertyValidationInterceptor implements NestInterceptor {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid ID');
    }

    const property = await this.propertyModel.findById(id);
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return next.handle().pipe(
      map((data) => {
        return data;
      }),
    );
  }
}

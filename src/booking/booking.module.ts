import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { AuthModule } from './../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, bookingSchema } from './schemas/booking.schema';
import { Property, propertySchema } from 'src/property/schemas/property.schema';
import { WebhookController } from './webhook.controller';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Booking.name, schema: bookingSchema },
      { name: Property.name, schema: propertySchema },
    ]),
  ],
  controllers: [BookingController, WebhookController],
  providers: [BookingService],
})
export class BookingModule {}

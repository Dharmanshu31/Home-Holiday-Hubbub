import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import Stripe from 'stripe';

@Controller('booking')
export class BookingController {
  constructor(private bookingService: BookingService) {}
  @Post('/:propertyId/:startEndDate')
  @UseGuards(AuthGuard())
  getBookingSession(
    @Req() req: Request,
    @Param('propertyId') propertyId: string,
    @Param('startEndDate') startEndDate: string,
  ): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    return this.bookingService.getBookingSession(req, propertyId,startEndDate);
  }
}

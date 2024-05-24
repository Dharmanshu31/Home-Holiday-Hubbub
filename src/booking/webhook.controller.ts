import { Body, Controller, Post } from '@nestjs/common';
import { BookingService } from './booking.service';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

@Controller('webhook')
export class WebhookController {
  constructor(private bookingService: BookingService) {}

  @Post()
  async webhook(@Body() event: Stripe.Event) {
    try {
      this.bookingService.handalWebHookBooking(event);
    } catch (err) {
      console.log(err);
    }
  }
}

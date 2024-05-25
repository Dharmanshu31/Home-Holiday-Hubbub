import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { BookingService } from './booking.service';
import Stripe from 'stripe';
import { Request, Response } from 'express';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

@Controller()
export class WebhookController {
  constructor(private bookingService: BookingService) {}

  @Post('/webhook')
  async webhook(@Body() event: Stripe.Event, @Res() res: Response) {
    try {
      this.bookingService.handalWebHookBooking(event);
      res.json({ message: 'recived the payment' });
    } catch (err) {
      res.status(400).json({ message: 'faile to proceess payment' });
    }
  }
}

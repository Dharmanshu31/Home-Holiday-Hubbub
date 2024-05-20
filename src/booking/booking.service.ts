import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Booking } from './schemas/booking.schema';
import { Model } from 'mongoose';
import { Request } from 'express';
import { Property } from 'src/property/schemas/property.schema';
import Stripe from 'stripe';
@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Property.name) private propertyModel: Model<Property>,
  ) {}

  async getBookingSession(
    req: Request,
    propertyId: string,
    startEndDate: string,
  ): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    const startDate = startEndDate.split('-')[0];
    const endDate = startEndDate.split('-')[1];
    const calcStartDate = new Date(startDate);
    const calcEndDate = new Date(endDate);
    const diffranceInDate = calcEndDate.getTime() - calcStartDate.getTime();
    let duration = diffranceInDate / (1000 * 3600 * 24);
    if (duration === 0) {
      duration = 1;
    }
    const stripe = require('stripe')(process.env.STRIP_SECRET);
    const property = await this.propertyModel.findById(propertyId);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `http://localhost:5173/trip-history/${req.user['_id']}`,
      cancel_url: `http://localhost:5173/`,
      customer_email: req.user['email'],
      client_reference_id: propertyId,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `${property.name} Home`,
              description: property.description,
              images: [
                'https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=650',
              ],
            },
            unit_amount: +property.pricePerNight * 100 * duration,
          },
          quantity: 1,
        },
      ],
    });
    return session;
  }
}

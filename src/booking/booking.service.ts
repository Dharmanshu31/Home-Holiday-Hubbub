import { Injectable, NotFoundException } from '@nestjs/common';
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
    let duration = diffranceInDate / (1000 * 3600 * 24) + 1;
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
    if (session) {
      await this.bookingModel.create({
        userId: req.user['_id'],
        propertyId,
        ownerId: property.owner,
        startDate,
        endDate,
        totalPrice: +property.pricePerNight * duration,
        paymentIntentId: session.payment_intent,
        status: 'pending',
      });
      // property.bookings.push({ startDate: calcStartDate, endDate: calcEndDate });
      // await property.save({ validateBeforeSave: false });
    }
    return session;
  }

  async handalWebHookBooking(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;
        const booking = await this.bookingModel.findOne({ paymentIntentId });
        if (booking) {
          booking.status = 'completed';
          booking.paymentIntentId = paymentIntentId;
          await booking.save({ validateBeforeSave: false });
        }
        const property = await this.propertyModel.findById(booking.propertyId);
        if (property) {
          property.bookings.push({
            startDate: new Date(booking.startDate),
            endDate: new Date(booking.endDate),
          });
          await property.save({ validateBeforeSave: false });
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }

  async getAllBookings(): Promise<Booking[]> {
    const bookings = await this.bookingModel.find();
    if (!bookings) {
      throw new NotFoundException();
    }
    return bookings;
  }

  async getAllUserBooking(userId: string) {
    const bookings = await this.bookingModel.find({ userId }).populate('propertyId');
    if (!bookings) {
      throw new NotFoundException();
    }
    return bookings;
  }

  async getAllBookingForOwner(ownerId: string) {
    const bookings = await this.bookingModel
      .find({ ownerId })
      .populate('propertyId')
      .populate({ path: 'userId', select: 'name' });
    if (!bookings) {
      throw new NotFoundException();
    }
    return bookings;
  }

  async deleteBooking(bookingId: string): Promise<string> {
    const booking = await this.bookingModel.findByIdAndDelete(bookingId);
    if (!booking) {
      throw new NotFoundException();
    }
    const property = await this.propertyModel.findById(booking.propertyId);
    const index = property.bookings.findIndex(
      (b) =>
        b.startDate.getTime() === booking.startDate.getTime() &&
        b.endDate.getTime() === booking.endDate.getTime(),
    );
    if (index !== -1) {
      property.bookings.splice(index, 1);
      const sixDay = Math.ceil(
        (booking.startDate.getTime() - booking.createdAt.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      if (sixDay >= 6) {
        const stripe = require('stripe')(process.env.STRIP_SECRET);
        await stripe.refunds.create({
          payment_intent: booking.paymentIntentId,
        });
      }
      await property.save({ validateBeforeSave: false });
    }
    return 'Booking deleted';
  }
}

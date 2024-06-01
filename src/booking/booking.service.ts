import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Booking } from './schemas/booking.schema';
import { Model, Types } from 'mongoose';
import { Request } from 'express';
import { Property } from 'src/property/schemas/property.schema';
import Stripe from 'stripe';
import { sendEmail } from 'src/utils/email';
@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Property.name) private propertyModel: Model<Property>,
  ) {}

  //create session of strip and make booking and frizz the date for 30min
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
      expires_at: Math.floor(Date.now() / 1000) + 1800,
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
            },
            unit_amount: +property.pricePerNight * 100 * duration,
          },
          quantity: 1,
        },
      ],
      metadata: {
        propertyId,
      },
    });
    if (session) {
      const booking = await this.bookingModel.create({
        userId: req.user['_id'],
        propertyId,
        ownerId: property.owner,
        startDate,
        endDate,
        totalPrice: +property.pricePerNight * duration,
        paymentIntentId: session.id,
        status: 'pending',
      });

      const propertytoCheck = await this.propertyModel.findById(booking.propertyId);
      if (propertytoCheck) {
        propertytoCheck.bookings.push({
          startDate: new Date(booking.startDate),
          endDate: new Date(booking.endDate),
        });
        await propertytoCheck.save({ validateBeforeSave: false });
      }

      setTimeout(
        async () => {
          const bookingToCheck = await this.bookingModel.findById(booking._id);
          if (bookingToCheck && bookingToCheck.status === 'pending') {
            const startDate = new Date(booking.startDate);
            const endDate = new Date(booking.endDate);
            const index = propertytoCheck.bookings.findIndex(
              (booking) =>
                booking.startDate.getTime() === startDate.getTime() &&
                booking.endDate.getTime() === endDate.getTime(),
            );
            if (index !== -1) {
              propertytoCheck.bookings.splice(index, 1);
              await propertytoCheck.save({ validateBeforeSave: false });
              await bookingToCheck.deleteOne();
            }
          }
        },
        30 * 60 * 1000,
      );
    }
    return session;
  }

  //webHook hander of strip which chnage the status of payment
  async handalWebHookBooking(event: Stripe.Event) {
    let booking: Booking;
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const paymentIntentId = event.data.object.id;
          booking = await this.bookingModel
            .findOne({ paymentIntentId })
            .populate({ path: 'userId', select: 'email' })
            .populate({ path: 'ownerId', select: 'email' });
          if (booking) {
            booking.status = 'completed';
            booking.paymentIntentId = event.data.object.payment_intent as string;
            await booking.save({ validateBeforeSave: false });

            const user = booking.userId as any;
            const owner = booking.ownerId as any;
            const message = `
                  <p>This is confirmation Email for Success full Booking</p>
                  <p>you Booking is from ${booking.startDate} to ${booking.endDate}</p>
                  <p><b>user email --${user.email}</b></p>
                  <p><b>user email --${owner.email}</b></p>
                   `;

            await sendEmail({
              email: user.email,
              subject: 'Boooking Detail',
              html: message,
            });
            await sendEmail({
              email: owner.email,
              subject: 'Booking Detail',
              html: message,
            });
          }
          break;
        }
      }
    } catch (err) {
      if (booking) {
        this.bookingModel.deleteOne({ id: booking._id });
      }
      throw new Error('Failed to process payment');
    }
  }

  //get all booking for admin
  async getAllBookings(): Promise<Booking[]> {
    const bookings = await this.bookingModel
      .find({ status: 'completed' })
      .populate('propertyId')
      .populate({ path: 'userId', select: 'name' });
    if (!bookings) {
      throw new NotFoundException();
    }
    return bookings;
  }

  //get booking of user
  async getAllUserBooking(userId: string) {
    const bookings = await this.bookingModel
      .find({ userId, status: 'completed' })
      .populate('propertyId');
    if (!bookings) {
      throw new NotFoundException();
    }
    return bookings;
  }

  //show booking on base of property
  async getAllBookingsWithPropertyId(propertyId: string) {
    const bookings = await this.bookingModel
      .find({ propertyId, status: 'completed' })
      .select('propertyId');
    if (!bookings) {
      throw new NotFoundException();
    }
    return bookings;
  }

  //get booking for owner
  async getAllBookingForOwner(ownerId: string) {
    const bookings = await this.bookingModel
      .find({ ownerId, status: 'completed' })
      .populate('propertyId')
      .populate({ path: 'userId', select: 'name' });
    if (!bookings) {
      throw new NotFoundException();
    }
    return bookings;
  }

  //delete Booking and provide refund
  async deleteBooking(bookingId: string): Promise<string> {
    const booking = await this.bookingModel
      .findById(bookingId)
      .populate({ path: 'userId', select: 'email' })
      .populate({ path: 'ownerId', select: 'email' });
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
      const sixDay = Math.ceil(
        (booking.startDate.getTime() - booking.createdAt.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      if (sixDay >= 6) {
        const stripe = require('stripe')(process.env.STRIP_SECRET);
        const refund = await stripe.refunds.create({
          payment_intent: booking.paymentIntentId,
        });
        const user = booking.userId as any;
        const owner = booking.ownerId as any;
        const message = `
                  <p>This is confirmation Email for Cancelation of Booking of ${property.name}</p>
                  <p>You have book ${property.name} from ${booking.startDate} to ${booking.endDate} is cancel </p>
                  <p><b>You will get your Refund in 15 Working Day</b></p>
                  <p><b>user email --${user.email}</b></p>
                  <p><b>user email --${owner.email}</b></p>
                   `;

        if (refund) {
          property.bookings.splice(index, 1);
          await property.save({ validateBeforeSave: false });
          await booking.deleteOne();
          await sendEmail({
            email: user.email,
            subject: 'Booking Cancelation Confirmation Mail',
            html: message,
          });
          await sendEmail({
            email: owner.email,
            subject: 'Booking Cancelation Confirmation Mail',
            html: message,
          });
        }
      } else {
        throw new NotFoundException(
          "Can't Refund When booking have lessthen 6 Day remain",
        );
      }
    }
    return 'Booking deleted';
  }

  //total earning of user
  async getTotalEarning(ownerId: string) {
    const currentYear = new Date().getFullYear();
    const result = await this.bookingModel.aggregate([
      {
        $match: {
          ownerId: new Types.ObjectId(ownerId),
          status: 'completed',
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' } },
          totalEarning: { $sum: '$totalPrice' },
        },
      },
      {
        $project: {
          month: '$_id.month',
          totalEarning: 1,
          _id: 0,
        },
      },
    ]);

    const monthEarning = Array(12).fill(0);

    result.forEach((earning) => {
      monthEarning[earning.month - 1] = earning.totalEarning;
    });
    return monthEarning;
  }

    //admin work
    async numberOfBookings(): Promise<number> {
      const booking = await this.bookingModel.countDocuments();
      return booking;
    }
}

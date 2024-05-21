import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import Stripe from 'stripe';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Booking } from './schemas/booking.schema';

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
    return this.bookingService.getBookingSession(req, propertyId, startEndDate);
  }

  @Get('admin')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles('admin')
  getAllBookings(): Promise<Booking[]> {
    return this.bookingService.getAllBookings();
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard())
  getAllUserBooking(@Param('userId') userId: string): Promise<Booking[]> {
    return this.bookingService.getAllUserBooking(userId);
  }

  @Get('owner/:ownerId')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles('landlord', 'admin')
  getAllBookingForOwner(@Param('ownerId') ownerId: string): Promise<Booking[]> {
    return this.bookingService.getAllBookingForOwner(ownerId);
  }

  @Delete('/:bookingId')
  @UseGuards(AuthGuard())
  deleteBooking(@Param('bookingId') bookingId: string): Promise<string> {
    return this.bookingService.deleteBooking(bookingId);
  }
}

import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import Stripe from 'stripe';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Booking } from './schemas/booking.schema';
import { Query as ExpressQuery } from 'express-serve-static-core';

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
  getAllBookings(@Query() query: ExpressQuery) {
    return this.bookingService.getAllBookings(query);
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard())
  getAllUserBooking(@Param('userId') userId: string, @Query() query: ExpressQuery) {
    return this.bookingService.getAllUserBooking(userId, query);
  }

  @Get('property/:propertyId')
  @UseGuards(AuthGuard())
  getAllBookingsWithPropertyId(
    @Param('propertyId') propertyId: string,
    @Req() req: Request,
  ): Promise<Booking[]> {
    return this.bookingService.getAllBookingsWithPropertyId(propertyId, req);
  }

  @Get('owner/:ownerId')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles('landlord', 'admin')
  getAllBookingForOwner(@Param('ownerId') ownerId: string, @Query() query: ExpressQuery) {
    return this.bookingService.getAllBookingForOwner(ownerId, query);
  }

  @Get('owner/:ownerId/earning')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles('landlord', 'admin')
  getTotalEarning(@Param('ownerId') ownerId: string) {
    return this.bookingService.getTotalEarning(ownerId);
  }

  @Delete('/:bookingId')
  @UseGuards(AuthGuard())
  deleteBooking(@Param('bookingId') bookingId: string): Promise<string> {
    return this.bookingService.deleteBooking(bookingId);
  }

  //admin
  @Get('admin/numberOfBookings')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles('admin')
  numberOfProperty(): Promise<number> {
    return this.bookingService.numberOfBookings();
  }
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Booking extends Document {
  @Prop({
    type: mongoose.Schema.ObjectId,
    ref: 'Property',
    required: [true, 'Must Have Property Id'],
  })
  propertyId: string;

  @Prop({
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Must Have user Id'],
  })
  userId: string;

  @Prop({ type: mongoose.Schema.ObjectId, required: [true, 'Must Have owner Id'] })
  ownerId: string;

  @Prop()
  paymentIntentId: string;

  @Prop({ required: [true, 'Must Start Date'] })
  startDate: Date;

  @Prop({ required: [true, 'Must End Date'] })
  endDate: Date;

  @Prop({ required: [true, 'Must Total Price'] })
  totalPrice: number;

  @Prop({ required: [true, 'Must Status'] })
  status: string;

  @Prop({ default: Date.now() })
  createdAt: Date;
}

export const bookingSchema = SchemaFactory.createForClass(Booking);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Booking extends Document {
  @Prop({ type: mongoose.Schema.ObjectId, ref: 'Property' })
  propertyId: string;

  @Prop({ type: mongoose.Schema.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ type: mongoose.Schema.ObjectId })
  ownerId: string;

  @Prop()
  paymentIntentId: string;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop()
  totalPrice: number;

  @Prop()
  status: string;

  @Prop({ default: Date.now() })
  createdAt: Date;
}

export const bookingSchema = SchemaFactory.createForClass(Booking);

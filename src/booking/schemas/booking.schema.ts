import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Booking extends Document {
  @Prop({ type: mongoose.Schema.ObjectId })
  propertyId: string;

  @Prop({ type: mongoose.Schema.ObjectId })
  userId: string;

  @Prop({ type: mongoose.Schema.ObjectId })
  ownerId: string;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop()
  totalPrice: number;

  @Prop({ default: Date.now() })
  createdAt: Date;
}

export const bookingSchema = SchemaFactory.createForClass(Booking);

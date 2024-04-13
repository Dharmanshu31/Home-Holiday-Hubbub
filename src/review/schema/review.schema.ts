import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Review extends Document {
  @Prop({ required: [true, 'Can`t post empty review'] })
  review: string;

  @Prop({ min: 1, max: 5, required: [true, 'Ratings Can`t be Empty'] })
  rating: number;

  @Prop({ default: Date.now() })
  createdAt: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Must Belong To one Property'],
  })
  property: string;

  @Prop({
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must have User'],
  })
  user: string;
}

export const reviewSchema = SchemaFactory.createForClass(Review);

reviewSchema.pre(/^find/, function (this: any, next: Function) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

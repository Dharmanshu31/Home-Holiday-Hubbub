import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Wishlist extends Document {
  @Prop({ type: mongoose.Schema.ObjectId, ref: 'User' })
  user: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.ObjectId, ref: 'Property' })
  property: mongoose.Types.ObjectId;
}

export const wishlistSchema = SchemaFactory.createForClass(Wishlist);

wishlistSchema.pre(/^find/, function (this: any, next: Function) {
  this.populate('property');
  next();
});

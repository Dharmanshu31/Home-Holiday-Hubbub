import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import slugify from 'slugify';

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Property extends Document {
  @Prop({
    required: [true, 'A property must have a name'],
    trim: true,
  })
  name: string;
  @Prop({
    type: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
      },
    ],
    default: [],
  })
  bookings: Array<{ startDate: Date; endDate: Date }>;
  @Prop()
  slug: string;
  @Prop({ required: [true, 'A property must have a description'], trim: true })
  description: string;
  @Prop({ required: [true, 'A property must have a highlight'], trim: true })
  highlight: string;
  @Prop({ required: [true, 'A property must have a highlightDetail'], trim: true })
  highlightDetail: string;
  @Prop({ required: [true, 'A property must have a highlight'] })
  propertyCategory: string;
  @Prop({ required: [true, 'A property must have a highlight'] })
  propertyType: string;
  @Prop()
  address: string;
  @Prop({
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: {
      type: [Number],
    },
    formattedAddress: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipcode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  })
  location: {
    type: string;
    coordinates: Number[];
    formattedAddress: String;
    city: String;
    state: String;
    zipcode: String;
    country: String;
  };

  @Prop({ required: [true, 'A property must have a price per night'] })
  pricePerNight: Number;
  @Prop({
    required: [true, 'A property must specify the maximum number of guests'],
  })
  maxGuests: Number;
  @Prop({
    required: [true, 'A property must specify the number of bedrooms'],
  })
  bedrooms: Number;
  @Prop({ required: [true, 'A property must specify the number of bathrooms'] })
  bathrooms: Number;
  @Prop({ required: [true, 'A property must have a size in square feet'] })
  bed: Number;
  @Prop()
  amenities: string[];
  @Prop({
    default: 0,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
  })
  ratingsAverage: Number;
  @Prop({ default: 0 })
  ratingQuantity: Number;
  @Prop()
  images: string[];
  @Prop({ default: Date.now(), select: false })
  createdAt: Date;
  @Prop({ type: mongoose.Schema.ObjectId, ref: 'User' })
  owner: string;
}
export const propertySchema = SchemaFactory.createForClass(Property);

propertySchema.pre('save', function (next: Function) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

propertySchema.pre(/^find/, function (this: any, next: Function) {
  this.populate({
    path: 'owner',
    select: 'name',
  });
  next();
});

propertySchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'property',
  localField: '_id',
});

propertySchema.index({ location: '2dsphere' });

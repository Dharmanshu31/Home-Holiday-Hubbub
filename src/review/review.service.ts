import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review } from './schema/review.schema';
import mongoose, { Model } from 'mongoose';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Property } from 'src/property/schemas/property.schema';
import { Query } from 'express-serve-static-core';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Property.name) private propertyModel: Model<Property>,
  ) {}

  async averageRating(propertyId: string): Promise<void> {
    const stats = await this.reviewModel.aggregate([
      { $match: { property: new mongoose.Types.ObjectId(propertyId) } },
      {
        $group: {
          _id: '$property',
          nRating: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);
    const updateData =
      stats.length > 0
        ? {
            ratingQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating.toFixed(1),
          }
        : { ratingQuantity: 0, ratingsAverage: 0 };
    const property = await this.propertyModel.findByIdAndUpdate(propertyId, updateData);
    if (!property) {
      throw new NotFoundException({
        message: 'There is no property available with this id ',
      });
    }
    await property.save({ validateBeforeSave: false });
  }

  async getReview(propertyId: string, query: Query): Promise<Review[]> {
    let que = this.reviewModel.find({ property: propertyId });
    if (query.limit) {
      const limit = +query.limit;
      que = que.limit(limit);
    }
    let review = await que;
    if (!review) {
      throw new NotFoundException({
        message: 'There is no review available with this id ',
      });
    }
    return review;
  }

  async createReview(
    propertyId: string,
    userId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    const newDto = {
      ...createReviewDto,
      property: propertyId,
      user: userId,
    };
    const review = await this.reviewModel.create(newDto);
    if (!review) {
      throw new HttpException(
        'Failed to create something',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    await this.averageRating(propertyId);
    return review;
  }

  async updateReview(
    propertyId: string,
    reviewId: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    const review = await this.reviewModel.findByIdAndUpdate(reviewId, updateReviewDto, {
      new: true,
      runValidators: true,
    });
    if (!review) {
      throw new NotFoundException({
        message: 'There is no review available with this id ',
      });
    }
    await this.averageRating(propertyId);
    return review;
  }

  async deleteReview(propertyId: string, reviewId: string): Promise<void> {
    const review = await this.reviewModel.findByIdAndDelete(reviewId);
    if (!review) {
      throw new NotFoundException({
        message: 'There is no review available with this id ',
      });
    }
    await this.averageRating(propertyId);
  }
  //admin work
  async numberOfReviews(): Promise<number> {
    const reviews = await this.reviewModel.countDocuments();
    return reviews;
  }
}

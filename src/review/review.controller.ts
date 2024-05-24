import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Review } from './schema/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Query as ExpressQuery } from 'express-serve-static-core';

@Controller()
export class ReviewController {
  constructor(private reviewService: ReviewService) {}
  @Get(':propertyId/review')
  getReview(
    @Param('propertyId') propertyId: string,
    @Query() query: ExpressQuery,
  ): Promise<Review[]> {
    return this.reviewService.getReview(propertyId, query);
  }

  @Post(':propertyId/review')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles('user', 'admin')
  createReview(
    @Param('propertyId') propertyId: string,
    @Req() req: Request,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    return this.reviewService.createReview(propertyId, req.user['_id'], createReviewDto);
  }

  @Patch(':propertyId/review/:reviewId')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles('user', 'admin')
  updatereview(
    @Param('propertyId') propertyId: string,
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    return this.reviewService.updateReview(propertyId, reviewId, updateReviewDto);
  }

  @Delete(':propertyId/review/:reviewId')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles('user', 'admin')
  @HttpCode(204)
  deletereview(
    @Param('propertyId') propertyId: string,
    @Param('reviewId') reviewId: string,
  ): Promise<void> {
    return this.reviewService.deleteReview(propertyId, reviewId);
  }

  //admin
  @Get('review/admin/numberOfReviews')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles('admin')
  numberOfReviews(): Promise<number> {
    return this.reviewService.numberOfReviews();
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
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

@Controller('review')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}
  @Get()
  @UseGuards(AuthGuard())
  getReview(@Req() req: Request): Promise<Review[]> {
    return this.reviewService.getReview(req);
  }

  @Post()
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles('user', 'admin')
  createReview(
    @Param('propertyId') propertyId: string,
    @Req() req: Request,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    return this.reviewService.createReview(propertyId, req.user['_id'], createReviewDto);
  }

  @Patch(':reviewId')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles('user', 'admin')
  updatereview(
    @Param('propertyId') propertyId: string,
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    return this.reviewService.updateReview(propertyId, reviewId, updateReviewDto);
  }

  @Delete(':reviewId')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles('user', 'admin')
  @HttpCode(204)
  deletereview(
    @Param('propertyId') propertyId: string,
    @Param('reviewId') reviewId: string,
  ): Promise<void> {
    return this.reviewService.deleteReview(propertyId, reviewId);
  }
}

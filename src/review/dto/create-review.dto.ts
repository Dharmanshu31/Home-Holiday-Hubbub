import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty({ message: 'Review cannot be empty' })
  review: string;

  @IsNotEmpty({ message: 'Ratings Can`t be Empty' })
  @IsNumber({}, { message: 'Rating must be a number' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must not exceed 5' })
  rating: number;
}

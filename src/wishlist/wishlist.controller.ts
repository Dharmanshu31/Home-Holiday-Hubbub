import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { Wishlist } from './schema/wishlist.schema';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Post(':propertyId')
  @UseGuards(AuthGuard())
  addWish(
    @Param('propertyId') propertyId: string,
    @Req() req: Request,
  ): Promise<Wishlist> {
    return this.wishlistService.addWish(propertyId, req.user['_id']);
  }

  @Get()
  @UseGuards(AuthGuard())
  getWiselist(@Req() req: Request): Promise<Wishlist[]> {
    return this.wishlistService.getWishlist(req.user['_id']);
  }

  @Delete(':wishId')
  @UseGuards(AuthGuard())
  @HttpCode(204)
  deleteWish(@Param('wishId') wishId: string): Promise<void> {
    return this.wishlistService.deleteWish(wishId);
  }
}

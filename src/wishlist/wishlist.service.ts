import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Wishlist } from './schema/wishlist.schema';
import { Model } from 'mongoose';

@Injectable()
export class WishlistService {
  constructor(@InjectModel(Wishlist.name) private wishlistModel: Model<Wishlist>) {}
  async addWish(propertyId: string, userId: string): Promise<Wishlist> {
    const wishProperty = await this.wishlistModel.create({
      user: userId,
      property: propertyId,
    });
    return wishProperty;
  }

  async getWishlist(userId: string): Promise<Wishlist[]> {
    const wishlist = await this.wishlistModel.find({ user: userId });
    if (!wishlist) {
      throw new NotFoundException({ message: 'No wishlist found with this userId' });
    }
    return wishlist;
  }

  async deleteWish(wishId: string): Promise<void> {
    const wish = await this.wishlistModel.findByIdAndDelete(wishId);
    if (!wish) {
      throw new NotFoundException({ message: 'No wishlist found with this Id' });
    }
  }
}

import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Wishlist, wishlistSchema } from './schema/wishlist.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Wishlist.name, schema: wishlistSchema }]),
  ],
  providers: [WishlistService],
  controllers: [WishlistController],
})
export class WishlistModule {}

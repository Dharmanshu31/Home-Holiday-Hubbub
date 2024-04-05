import { Module } from '@nestjs/common';
import { PropertyModule } from './property/property.module';
import { UserModule } from './user/user.module';
import { ReviewModule } from './review/review.module';
import { BookingModule } from './booking/booking.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PropertyModule,
    UserModule,
    ReviewModule,
    BookingModule,
    AuthModule,
  ],
  providers: [],
})
export class AppModule {}

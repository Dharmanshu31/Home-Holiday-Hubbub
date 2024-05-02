import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import * as mongoSanitize from 'express-mongo-sanitize';
import * as xss from 'xss-clean';
import * as hpp from 'hpp';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.use(cookieParser());
  // app.use(
  //   rateLimit({
  //     windowMs: 15 * 60 * 1000,
  //     max: 100,
  //   }),
  // );
  app.use(helmet());
  app.use(mongoSanitize());
  app.use(xss());
  app.use(
    hpp({
      whitelist: [
        'ratingsQuantity',
        'ratingsAverage',
        'pricePerNight',
        'bedrooms',
        'bathrooms',
      ],
    }),
  );

  await app.listen(3000);
}
bootstrap();

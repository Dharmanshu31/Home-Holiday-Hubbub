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
  
  //handel cors 
  app.enableCors();

  //provide globle error validtion
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  //parse cookie data
  app.use(cookieParser());
  // app.use(
  //   rateLimit({
  //     windowMs: 60 * 60 * 1000,
  //     max: 10000,
  //     message: 'To Many Request From Same IP Try After Few 1 Hours',
  //   }),
  // );

  //use helmet for secure header
  app.use(helmet());

  //for NoSQL Attack
  app.use(mongoSanitize());

  //for xss attack
  app.use(xss());

  //parameter polution for same fileds
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

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';

//golobal exeption filter
@Catch()
export class AsyncExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const cxt = host.switchToHttp();
    const response = cxt.getResponse<Response>();
    const request = cxt.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server Error';
    if (exception instanceof HttpException) {
      const responseObj = exception.getResponse();
      if (
        typeof responseObj === 'object' &&
        responseObj.hasOwnProperty('message')
      ) {
        message = responseObj['message'];
      }
      status = exception.getStatus();
    } else if (
      exception instanceof Error &&
      exception.message.includes('ECONNREFUSED')
    ) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Service Unavailable - Database connection failed';
    } else if (exception instanceof MongoError && exception.code === 11000) {
      status = HttpStatus.BAD_REQUEST;
      message = 'User Already Exist!!!';
    } else if (exception instanceof Error && exception.name === 'CastError') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid ID';
    } else if (
      exception instanceof Error &&
      exception.message.includes('ValidationError')
    ) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data for update';
    } else if (exception && typeof exception['message'] === 'string') {
      message = exception['message'];
    }
    response.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

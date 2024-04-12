import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/signUp.dto';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { ForgetPasswordDto } from './dto/forgetPassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signUp')
  signUp(@Body() createUser: CreateUserDto): Promise<User> {
    return this.authService.signUp(createUser);
  }

  @Get('login')
  login(@Body() loginDto: LoginDto): Promise<{ token: string; user: User }> {
    return this.authService.login(loginDto);
  }

  @Post('forgetPassword')
  forgetPassword(
    @Body() forgetPasswordDto: ForgetPasswordDto,
    @Req() req: Request,
  ): Promise<string> {
    return this.authService.forgetPassword(forgetPasswordDto, req);
  }

  @Patch('resetPassword/:token')
  resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<string> {
    return this.authService.resetPassword(token, resetPasswordDto);
  }
}

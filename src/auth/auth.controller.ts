import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/signUp.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { ForgetPasswordDto } from './dto/forgetPassword.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signUp')
  @UseInterceptors(FileInterceptor('photo'))
  signUp(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUser: CreateUserDto,
  ): Promise<User> {
    return this.authService.signUp(createUser, file);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<{ token: string; user: User }> {
    return this.authService.login(loginDto);
  }

  @Post('forgetPassword')
  forgetPassword(
    @Body() forgetPasswordDto: ForgetPasswordDto,
  ): Promise<string> {
    return this.authService.forgetPassword(forgetPasswordDto);
  }

  @Patch('resetPassword/:token')
  resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ token: string; user: User }> {
    return this.authService.resetPassword(token, resetPasswordDto);
  }
}

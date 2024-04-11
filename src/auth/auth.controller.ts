import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/signUp.dto';
import { LoginDto } from './dto/login.dto';

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
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { User } from 'src/auth/schemas/user.schema';
import { Request } from 'express';
import { UpdateuserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard())
  getMe(@Req() req: Request) {
    return this.userService.getMe(req);
  }

  @Patch('updateMe')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('photo'))
  updateMe(
    @UploadedFile() file: Express.Multer.File,
    @Body() updateUserDto: UpdateuserDto,
    @Req() req: Request,
  ) {
    return this.userService.updateMe(updateUserDto, req, file);
  }

  @Patch('updatePassword')
  @UseGuards(AuthGuard())
  updatePassword(@Body() updatePasswordDto: UpdatePasswordDto, @Req() req: Request) {
    return this.userService.updatePassword(updatePasswordDto, req);
  }

  @Delete('deleteMe')
  @UseGuards(AuthGuard())
  @HttpCode(204)
  deleteMe(@Req() req: Request): Promise<void> {
    return this.userService.deleteMe(req);
  }

  //admin work
  @Get()
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles('admin')
  getAllUser(): Promise<User[]> {
    return this.userService.getAllUser();
  }

  @Patch(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles('admin')
  updateUserByAdmin(
    @Body() updateUserDto: UpdateuserDto,
    @Param('id') id: string,
  ): Promise<User> {
    return this.userService.updateUserByAdmin(updateUserDto, id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard(), RoleGuard)
  @Roles('admin')
  deleteUserByAdmin(@Param('id') id: string): Promise<void> {
    return this.userService.deleteUserByAdmin(id);
  }
}

import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { UpdateuserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as sharp from 'sharp';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getMe(req: Request): Promise<User> {
    const user = await this.userModel.findById(req.user['_id']);
    if (!user) {
      throw new NotFoundException({
        message: 'No User found with that ID. Please check the ID and try again. ',
      });
    }
    return user;
  }

  async updateMe(
    updateUserDto: UpdateuserDto,
    req: Request,
    file: Express.Multer.File,
  ): Promise<User> {
    if (file) {
      const filename = `user-${updateUserDto.name ? updateUserDto.name : req.user['name']}-${Date.now()}.jpeg`;
      await sharp(file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/imgs/users/${filename}`);
      updateUserDto.photo = filename;
    }
    const user = await this.userModel.findByIdAndUpdate(req.user['_id'], updateUserDto, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      throw new NotFoundException({
        message: 'No User found with that ID. Please check the ID and try again. ',
      });
    }

    return user;
  }

  async deleteMe(req: Request): Promise<void> {
    const user = await this.userModel.findByIdAndDelete(req.user['_id']);
    if (!user) {
      throw new NotFoundException({
        message: 'No User found with that ID. Please check the ID and try again. ',
      });
    }
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto, req: Request) {
    const user = await this.userModel.findById(req.user['_id']).select('+password');
    if (!(await user.comparePassword(updatePasswordDto.currentPassword, user.password))) {
      throw new UnauthorizedException({
        message:
          'Incorrect old password. Please enter the correct password or reset your password.',
      });
    }
    user.password = updatePasswordDto.password;
    user.confirmPassword = updatePasswordDto.confirmPassword;
    await user.save();

    return user;
  }

  //admin work
  async getAllUser(): Promise<User[]> {
    const users = await this.userModel.find();
    return users;
  }
  async updateUserByAdmin(updateUserDto: UpdateuserDto, id: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      throw new NotFoundException({
        message: 'No User found with that ID. Please check the ID and try again. ',
      });
    }

    return user;
  }

  async deleteUserByAdmin(id: string): Promise<void> {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundException({
        message: 'No User found with that ID. Please check the ID and try again. ',
      });
    }
  }
}

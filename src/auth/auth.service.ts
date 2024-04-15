import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/signUp.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ForgetPasswordDto } from './dto/forgetPassword.dto';
import { Request, Response } from 'express';
import { sendEmail } from 'src/utils/email';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import * as crypto from 'crypto';
import * as sharp from 'sharp';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}
  async signUp(createUser: CreateUserDto, file: Express.Multer.File): Promise<User> {
    if (file) {
      const filename = `user-${createUser.name}-${Date.now()}.jpeg`;
      await sharp(file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/imgs/users/${filename}`);
      createUser.photo = filename;
    }
    const user = await this.userModel.create(createUser);
    return user;
  }

  async login(loginDto: LoginDto, res: Response): Promise<{ token: string; user: User }> {
    const user = await this.userModel
      .findOne({ email: loginDto.email })
      .select('+password');
    if (!user || !(await user.comparePassword(loginDto.password, user.password))) {
      throw new UnauthorizedException({
        message: 'Email or Password is InValid',
      });
    }
    const token = await this.jwtService.signAsync({ id: user._id });
    res.cookie('jwt', token, {
      secure: true,
      httpOnly: true,
      expires: new Date(
        Date.now() + parseInt(process.env.JWT_COOKIE_EXP) * 24 * 60 * 60 * 1000,
      ),
    });
    return { token, user };
  }

  async forgetPassword(
    forgetPasswordDto: ForgetPasswordDto,
    req: Request,
  ): Promise<string> {
    const user = await this.userModel.findOne({ email: forgetPasswordDto.email });
    if (!user) throw new UnauthorizedException('User Not Exist!!!');
    const randomToken = user.randomToken();
    user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${randomToken}`;

    const message = `
    <p>You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the following link to complete the process:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p><b>This Token Will Be Expire After 10 Minute So Huryy Up!!!!!!</b></p>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
  `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request for Home Holiday Hubbub',
        html: message,
      });
      return 'Token has been send to Your Email';
    } catch (err) {
      (user.passwordResetToken = undefined),
        (user.resetExpireTime = undefined),
        await user.save({ validateBeforeSave: false });
    }
  }

  async resetPassword(
    token: string,
    resetPasswordDto: ResetPasswordDto,
    res: Response,
  ): Promise<{ token: string; user: User }> {
    const hashToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.userModel
      .findOne({
        passwordResetToken: hashToken,
        resetExpireTime: { $gt: Date.now() },
      })
      .select('+password');
    if (!user) {
      user.passwordResetToken = undefined;
      user.resetExpireTime = undefined;
      user.save({ validateBeforeSave: false });
      throw new BadRequestException({
        message:
          'Invalid token or the reset link has expired. Please request a new password reset link.',
      });
    }
    user.password = resetPasswordDto.password;
    user.confirmPassword = resetPasswordDto.confirmPassword;
    user.passwordResetToken = undefined;
    user.resetExpireTime = undefined;
    user.passwordChangeAt = new Date(Date.now() - 1000);
    await user.save();
    const Jwttoken = await this.jwtService.signAsync({ id: user._id });
    res.cookie('jwt', Jwttoken, {
      secure: true,
      httpOnly: true,
      expires: new Date(
        Date.now() + parseInt(process.env.JWT_COOKIE_EXP) * 24 * 60 * 60 * 1000,
      ),
    });
    return { token: Jwttoken, user };
  }
}

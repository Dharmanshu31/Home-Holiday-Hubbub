import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from './user-role.enum';
import validator from 'validator';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Schema()
export class User extends Document {
  @Prop({ required: [true, 'Oops! It looks like you forgot to fill in Name'] })
  name: string;

  @Prop({
    required: [true, 'Oops! It looks like you forgot to fill in Email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Pls Enter Valid Email !!!!'],
  })
  email: string;

  @Prop({
    required: [true, 'Please set a password to continue.'],
    minlength: 8,
    maxlength: 20,
    validate: {
      validator: function (v: string) {
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(
          v,
        );
      },
      message:
        'Password must contain at least one digit, one lowercase letter, one uppercase letter, one special character, and be at least 8 characters long.',
    },
    select: false,
  })
  password: string;

  @Prop({
    required: [true, 'Please re-enter your password to confirm.'],
    validate: {
      validator: function (v: string) {
        return v === this.password;
      },
      message: 'Passwords do not match. Please make sure your passwords match.',
    },
  })
  confirmPassword: string;

  @Prop({ default: 'defualt.jpeg' })
  photo: string;

  @Prop({ enum: Role, default: Role.USER })
  role: Role;

  @Prop()
  passwordChangeAt: Date;

  @Prop()
  passwordResetToken: string;

  @Prop()
  resetExpireTime: Date;

  comparePassword: (providedPassword: string, userPassword: string) => Promise<boolean>;

  randomToken: () => string;
}

export const userSchema = SchemaFactory.createForClass(User);

userSchema.pre('save', async function (next: Function) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
  }
  next();
});

userSchema.methods.comparePassword = async function (
  providedPassword: string,
  userPassword: string,
) {
  return await bcrypt.compare(providedPassword, userPassword);
};

userSchema.methods.randomToken = function () {
  const randomToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(randomToken).digest('hex');
  this.resetExpireTime = Date.now() + 10 * 60 * 1000;
  return randomToken;
};
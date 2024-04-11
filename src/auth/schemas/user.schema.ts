import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from './user-role.enum';
import validator from 'validator';

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
  passwordResetToken: string;
  resetExpireTime: Date;
}

export const userSchema = SchemaFactory.createForClass(User);

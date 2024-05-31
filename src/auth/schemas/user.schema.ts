import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Mongoose } from 'mongoose';
import { Role } from './user-role.enum';
import validator from 'validator';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Schema()
export class User extends Document {
  @Prop({ required: [true, 'Oops! It looks like you forgot to fill in Name'] })
  name: string;

  @Prop({ required: [true, 'Oops! It looks like you forgot to fill in phone number'] })
  phone: string;

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

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
    ref: 'Property',
    default: [],
  })
  wishList: string[];

  @Prop()
  passwordChangeAt: Date;

  @Prop()
  passwordResetToken: string;

  @Prop()
  resetExpireTime: Date;

  @Prop({ default: true })
  isActive: boolean;

  comparePassword: (providedPassword: string, userPassword: string) => Promise<boolean>;

  randomToken: () => string;
}

export const userSchema = SchemaFactory.createForClass(User);

//encrypt user passoword on save action
userSchema.pre('save', async function (next: Function) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
  }
  next();
});

//check the password of user is valid or not
userSchema.methods.comparePassword = async function (
  providedPassword: string,
  userPassword: string,
) {
  return await bcrypt.compare(providedPassword, userPassword);
};

//generate token for forget password
userSchema.methods.randomToken = function () {
  const randomToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(randomToken).digest('hex');
  this.resetExpireTime = Date.now() + 10 * 60 * 1000;
  return randomToken;
};

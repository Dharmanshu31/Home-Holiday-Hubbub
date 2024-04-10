import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from './user-role.enum';

@Schema()
export class User extends Document {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  confirmPassword: string;

  @Prop({ default: 'defualt.jpeg' })
  photo: string;

  @Prop()
  role: Role;

  @Prop()
  passwordChangeAt: Date;
  passwordResetToken: string;
  resetExpireTime: Date;
}

export const userSchema = SchemaFactory.createForClass(User);

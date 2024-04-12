import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @Matches(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,
    {
      message:
        'Password must contain at least one digit, one lowercase letter, one uppercase letter, one special character, and be at least 8 characters long.',
    },
  )
  password: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @IsEmail({}, { message: 'Must be a valid administrator email address' })
  @IsNotEmpty({ message: 'Email address cannot be empty' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Access password cannot be empty' })
  @MinLength(8, { message: 'Security password must be at least 8 characters long' })
  password: string;
}

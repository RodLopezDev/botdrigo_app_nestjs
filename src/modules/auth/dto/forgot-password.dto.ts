import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'owner@botdrigo.com' })
  @IsEmail()
  email: string;
}

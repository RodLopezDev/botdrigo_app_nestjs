import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'owner@botdrigo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MyS3cret!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

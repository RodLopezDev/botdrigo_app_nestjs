import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsJWT()
  token: string;

  @ApiProperty({ example: 'MyN3wS3cret!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}

import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Verify Email DTO
 * Contains the verification code sent to user's email
 */
export class VerifyEmailDto {
  @ApiProperty({
    description: '6-digit email verification code',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'Verification code is required' })
  @Length(6, 6, { message: 'Verification code must be 6 digits' })
  code: string;
}

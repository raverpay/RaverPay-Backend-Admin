import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Verify Phone DTO
 * Contains the verification code sent to user's phone via SMS
 */
export class VerifyPhoneDto {
  @ApiProperty({
    description: '6-digit phone verification code',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'Verification code is required' })
  @Length(6, 6, { message: 'Verification code must be 6 digits' })
  code: string;
}

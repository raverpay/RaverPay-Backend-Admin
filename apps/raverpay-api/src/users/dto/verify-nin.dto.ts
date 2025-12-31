import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Verify NIN DTO
 * NIN (National Identification Number) for enhanced KYC verification
 */
export class VerifyNinDto {
  @ApiProperty({
    description: '11-digit National Identification Number (NIN)',
    example: '12345678901',
    minLength: 11,
    maxLength: 11,
    pattern: '^[0-9]{11}$',
  })
  @IsString()
  @IsNotEmpty({ message: 'NIN is required' })
  @Length(11, 11, { message: 'NIN must be exactly 11 digits' })
  @Matches(/^[0-9]{11}$/, { message: 'NIN must contain only digits' })
  nin: string;

  @ApiProperty({
    description: 'Date of Birth (YYYY-MM-DD) matching NIN record',
    example: '1990-01-01',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  @IsString()
  @IsNotEmpty({ message: 'Date of birth is required for NIN verification' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date of birth must be in YYYY-MM-DD format',
  })
  dateOfBirth: string;
}

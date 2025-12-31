import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Verify BVN DTO
 * BVN (Bank Verification Number) is required for KYC Tier 2
 */
export class VerifyBvnDto {
  @ApiProperty({
    description: '11-digit Bank Verification Number (BVN)',
    example: '12345678901',
    minLength: 11,
    maxLength: 11,
    pattern: '^[0-9]{11}$',
  })
  @IsString()
  @IsNotEmpty({ message: 'BVN is required' })
  @Length(11, 11, { message: 'BVN must be exactly 11 digits' })
  @Matches(/^[0-9]{11}$/, { message: 'BVN must contain only digits' })
  bvn: string;

  @ApiProperty({
    description: 'Date of Birth (YYYY-MM-DD) matching BVN record',
    example: '1990-01-01',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  @IsString()
  @IsNotEmpty({ message: 'Date of birth is required for BVN verification' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date of birth must be in YYYY-MM-DD format',
  })
  dateOfBirth: string;
}

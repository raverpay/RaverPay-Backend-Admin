import { IsString, IsOptional, IsDateString, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for requesting a dedicated virtual account
 * Requires BVN or NIN for customer validation (Nigerian Financial Services requirement)
 */
export class RequestVirtualAccountDto {
  @ApiPropertyOptional({
    description: 'Preferred bank slug (e.g., wema-bank)',
    example: 'wema-bank',
  })
  @IsOptional()
  @IsString()
  preferred_bank?: string;

  // BVN or NIN is required for customer validation
  @ApiPropertyOptional({
    description: 'Bank Verification Number (11 digits)',
    example: '12345678901',
    minLength: 11,
    maxLength: 11,
  })
  @IsOptional()
  @IsString()
  @Length(11, 11, { message: 'BVN must be exactly 11 digits' })
  bvn?: string;

  @ApiPropertyOptional({
    description: 'National Identification Number (11 digits)',
    example: '12345678901',
    minLength: 11,
    maxLength: 11,
  })
  @IsOptional()
  @IsString()
  @Length(11, 11, { message: 'NIN must be exactly 11 digits' })
  nin?: string;

  @ApiPropertyOptional({
    description: 'Date of Birth (ISO 8601 YYYY-MM-DD)',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiPropertyOptional({
    description: 'First Name',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({
    description: 'Last Name',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({
    description: 'Phone Number',
    example: '08012345678',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  // For BVN validation - user's bank account details
  @ApiPropertyOptional({
    description: 'Bank Account Number (10 digits) for validation',
    example: '0123456789',
    minLength: 10,
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @Length(10, 10, { message: 'Account number must be exactly 10 digits' })
  account_number?: string;

  @ApiPropertyOptional({
    description: 'Bank Code (e.g., 058 for GTBank)',
    example: '058',
  })
  @IsOptional()
  @IsString()
  bank_code?: string;
}

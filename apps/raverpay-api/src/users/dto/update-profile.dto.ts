import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

/**
 * Update Profile DTO
 * Allows users to update their basic profile information
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'First Name',
    example: 'John',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last Name',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Date of Birth (ISO 8601 string)',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Gender',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Address',
    example: '123 Main St, Lagos',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({
    description: 'City',
    example: 'Ikeja',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  city?: string;

  @ApiPropertyOptional({
    description: 'State',
    example: 'Lagos',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  state?: string;

  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string; // URL to avatar image
}

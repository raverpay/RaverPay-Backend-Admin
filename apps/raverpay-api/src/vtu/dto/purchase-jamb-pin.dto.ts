import {
  IsString,
  IsNumber,
  Min,
  Matches,
  Length,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PurchaseJAMBPinDto {
  @ApiProperty({
    description: 'JAMB Profile ID (10 digits)',
    example: '1234567890',
    pattern: '^\\d{10}$',
  })
  @IsString()
  @Matches(/^\d{10}$/, {
    message: 'Invalid JAMB Profile ID (must be 10 digits)',
  })
  profileId: string;

  @ApiProperty({
    description: 'Variation code (utme-mock or utme-no-mock)',
    example: 'utme-mock',
    enum: ['utme-mock', 'utme-no-mock'],
  })
  @IsString()
  @Matches(/^(utme-mock|utme-no-mock)$/, {
    message: 'Variation code must be utme-mock or utme-no-mock',
  })
  variationCode: string;

  @ApiProperty({
    description: '4-digit transaction PIN',
    example: '1234',
    minLength: 4,
    maxLength: 4,
  })
  @IsString()
  @Length(4, 4, { message: 'PIN must be exactly 4 digits' })
  @Matches(/^\d{4}$/, { message: 'PIN must contain only digits' })
  pin: string;

  // Cashback fields
  @ApiPropertyOptional({
    description: 'Whether to use cashback for this purchase',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  useCashback?: boolean;

  @ApiPropertyOptional({
    description: 'Amount of cashback to use',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cashbackAmount?: number;
}

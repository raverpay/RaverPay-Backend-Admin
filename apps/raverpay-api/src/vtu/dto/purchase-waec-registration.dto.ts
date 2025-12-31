import {
  IsString,
  IsNumber,
  Min,
  Length,
  Matches,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PurchaseWAECRegistrationDto {
  @ApiProperty({
    description: '11-digit phone number',
    example: '08012345678',
  })
  @IsString()
  @Matches(/^0[7-9][0-1]\d{8}$/, {
    message: 'Invalid Nigerian phone number',
  })
  phone: string;

  @ApiProperty({
    description: 'Variation code for WAEC registration',
    example: 'waec-registration',
  })
  @IsString()
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

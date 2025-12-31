import {
  IsString,
  IsNumber,
  IsEnum,
  Min,
  Matches,
  Length,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum MeterType {
  PREPAID = 'prepaid',
  POSTPAID = 'postpaid',
}

export class PayElectricityDto {
  @ApiProperty({
    description: 'Electricity distribution company (Disco)',
    example: 'ikeja-electric',
  })
  @IsString()
  disco: string; // e.g., "ikeja-electric", "eko-electric"

  @ApiProperty({
    description: 'Meter number (10-13 digits)',
    example: '12345678901',
    pattern: '^\\d{10,13}$',
  })
  @IsString()
  @Matches(/^\d{10,13}$/, {
    message: 'Meter number must be 10-13 digits',
  })
  meterNumber: string;

  @ApiProperty({
    description: 'Meter type (prepaid/postpaid)',
    example: MeterType.PREPAID,
    enum: MeterType,
  })
  @IsEnum(MeterType)
  meterType: MeterType;

  @ApiProperty({
    description: 'Amount to pay in Naira',
    example: 2000,
    minimum: 1000,
  })
  @IsNumber()
  @Min(1000, { message: 'Minimum electricity payment is ₦1,000' })
  amount: number;

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

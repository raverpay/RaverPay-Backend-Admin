import {
  IsString,
  IsNumber,
  Min,
  Max,
  Matches,
  Length,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PurchaseAirtimeDto {
  @ApiProperty({
    description: 'Mobile network provider',
    example: 'MTN',
    enum: ['MTN', 'GLO', 'AIRTEL', '9MOBILE'],
  })
  @IsString()
  @Matches(/^(MTN|GLO|AIRTEL|9MOBILE)$/i, {
    message: 'Network must be MTN, GLO, AIRTEL, or 9MOBILE',
  })
  network: string;

  @ApiProperty({
    description: '11-digit phone number',
    example: '08012345678',
    pattern: '^0[7-9][0-1]\\d{8}$',
  })
  @IsString()
  @Matches(/^0[7-9][0-1]\d{8}$/, {
    message: 'Invalid Nigerian phone number',
  })
  phone: string;

  @ApiProperty({
    description: 'Amount of airtime to purchase',
    example: 1000,
    minimum: 50,
    maximum: 50000,
  })
  @IsNumber()
  @Min(50, { message: 'Minimum airtime is ₦50' })
  @Max(50000, { message: 'Maximum airtime is ₦50,000' })
  amount: number;

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
    example: 50,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cashbackAmount?: number;
}

import {
  IsString,
  Matches,
  IsOptional,
  IsBoolean,
  Length,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PurchaseDataDto {
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
    description: 'Data plan product code',
    example: 'mtn-1gb-1000',
  })
  @IsString()
  productCode: string; // e.g., "mtn-1gb-1000" or "glo-dg-50"

  @ApiPropertyOptional({
    description: 'Whether this is an SME data plan (GLO only)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isSME?: boolean; // Optional flag to use SME data (only for GLO currently)

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
  useCashback?: boolean; // Whether user wants to apply cashback

  @ApiPropertyOptional({
    description: 'Amount of cashback to use',
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cashbackAmount?: number; // Amount of cashback to redeem
}

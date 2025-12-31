import { IsString, IsEmail, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseInternationalAirtimeDto {
  @ApiProperty({
    description: 'Recipient phone number with country code',
    example: '233501234567',
  })
  @IsString()
  billersCode: string; // Recipient phone number with country code

  @ApiProperty({
    description: 'Product variation code',
    example: 'GHA-MTN-10',
  })
  @IsString()
  variationCode: string; // Product variation code

  @ApiProperty({
    description: 'Operator ID from VTPass',
    example: 'GHA-MTN',
  })
  @IsString()
  operatorId: string; // Operator ID from VTPass

  @ApiProperty({
    description: 'Country code (ISO-2)',
    example: 'GH',
  })
  @IsString()
  countryCode: string; // Country code (e.g., 'GH', 'CM')

  @ApiProperty({
    description: 'Product type ID (1=Mobile Top Up, 4=Mobile Data)',
    example: '1',
  })
  @IsString()
  productTypeId: string; // Product type ID (1=Mobile Top Up, 4=Mobile Data)

  @ApiProperty({
    description: 'Customer email address',
    example: 'customer@example.com',
  })
  @IsEmail()
  email: string; // Customer email

  @ApiProperty({
    description: 'Nigerian customer phone number',
    example: '08012345678',
  })
  @IsString()
  phone: string; // Nigerian customer phone number

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
}

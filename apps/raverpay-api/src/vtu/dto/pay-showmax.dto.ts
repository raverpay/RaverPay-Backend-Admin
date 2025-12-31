import { IsString, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PayShowmaxDto {
  @ApiProperty({
    description: '11-digit phone number (used as biller code)',
    example: '08012345678',
    pattern: '^0[7-9][0-1]\\d{8}$',
  })
  @IsString()
  @Matches(/^0[7-9][0-1]\d{8}$/, {
    message: 'Invalid Nigerian phone number',
  })
  phoneNumber: string; // Showmax uses phone number as billersCode

  @ApiProperty({
    description: 'Showmax product code',
    example: 'full_3',
  })
  @IsString()
  productCode: string; // e.g., "full_3"

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

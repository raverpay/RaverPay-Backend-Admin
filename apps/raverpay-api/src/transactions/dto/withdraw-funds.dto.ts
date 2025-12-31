import {
  IsNumber,
  IsString,
  IsOptional,
  Min,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WithdrawFundsDto {
  @ApiProperty({
    description: 'Amount to withdraw in Naira',
    example: 10000,
    minimum: 100,
  })
  @IsNumber()
  @Min(100, { message: 'Minimum withdrawal amount is ₦100' })
  amount: number;

  @ApiProperty({
    description: 'Bank account number (10 digits)',
    example: '0123456789',
    minLength: 10,
    maxLength: 10,
    pattern: '^\\d{10}$',
  })
  @IsString()
  @Length(10, 10, { message: 'Account number must be exactly 10 digits' })
  @Matches(/^\d+$/, { message: 'Account number must contain only digits' })
  accountNumber: string;

  @ApiProperty({
    description: 'Account holder name',
    example: 'John Doe',
  })
  @IsString()
  accountName: string;

  @ApiProperty({
    description: 'Bank code',
    example: '058',
    minLength: 3,
    maxLength: 10,
  })
  @IsString()
  @Length(3, 10, { message: 'Bank code must be between 3 and 10 characters' })
  bankCode: string;

  @ApiPropertyOptional({
    description: 'Transaction narration/description',
    example: 'Withdrawal to savings account',
  })
  @IsOptional()
  @IsString()
  narration?: string;

  @ApiProperty({
    description: '4-digit transaction PIN',
    example: '1234',
    minLength: 4,
    maxLength: 4,
    pattern: '^\\d{4}$',
  })
  @IsString()
  @Length(4, 4, { message: 'PIN must be exactly 4 digits' })
  @Matches(/^\d{4}$/, { message: 'PIN must contain only digits' })
  pin: string;
}

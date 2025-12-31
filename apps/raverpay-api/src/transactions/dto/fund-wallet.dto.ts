import { IsNumber, IsOptional, IsUrl, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FundWalletDto {
  @ApiProperty({
    description: 'Amount to fund in Naira',
    example: 5000,
    minimum: 100,
  })
  @IsNumber()
  @Min(100, { message: 'Minimum funding amount is ₦100' })
  amount: number;

  @ApiPropertyOptional({
    description: 'Callback URL for payment notification',
    example: 'https://myapp.com/payment/callback',
  })
  @IsOptional()
  @IsUrl()
  callbackUrl?: string;
}

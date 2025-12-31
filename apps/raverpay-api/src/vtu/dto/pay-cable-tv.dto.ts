import {
  IsString,
  IsEnum,
  Matches,
  IsOptional,
  IsNumber,
  Min,
  Length,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum CableTVProvider {
  DSTV = 'DSTV',
  GOTV = 'GOTV',
  STARTIMES = 'STARTIMES',
}

enum SubscriptionType {
  CHANGE = 'change', // New subscription or change bouquet
  RENEW = 'renew', // Renew current bouquet
}

export class PayCableTVDto {
  @ApiProperty({
    description: 'Cable TV Provider',
    example: CableTVProvider.DSTV,
    enum: CableTVProvider,
  })
  @IsEnum(CableTVProvider)
  provider: CableTVProvider;

  @ApiProperty({
    description: 'Smartcard or IUC number (10 digits)',
    example: '1234567890',
    pattern: '^\\d{10}$',
  })
  @IsString()
  @Matches(/^\d{10}$/, {
    message: 'Invalid smartcard number (must be 10 digits)',
  })
  smartcardNumber: string;

  @ApiPropertyOptional({
    description: 'Product code (required for CHANGE subscription type)',
    example: 'dstv-padi',
  })
  @IsOptional()
  @IsString()
  productCode?: string; // Required for 'change', optional for 'renew'

  @ApiProperty({
    description: 'Subscription type (change/renew)',
    example: SubscriptionType.RENEW,
    enum: SubscriptionType,
  })
  @IsEnum(SubscriptionType)
  subscriptionType: SubscriptionType; // 'change' or 'renew'

  @ApiPropertyOptional({
    description: 'Number of months to pay for (DSTV/GOTV only)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number; // Number of months (DSTV/GOTV only)

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

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Deposit Status Enum
 */
export enum StablecoinDepositStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CONVERTED = 'CONVERTED',
  FAILED = 'FAILED',
}

/**
 * Query Stablecoin Deposits DTO
 */
export class QueryStablecoinDepositsDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Search by transaction hash, user email, or wallet address',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: StablecoinDepositStatus,
  })
  @IsOptional()
  @IsEnum(StablecoinDepositStatus)
  status?: StablecoinDepositStatus;

  @ApiPropertyOptional({
    description: 'Filter by token type (USDC, USDT)',
  })
  @IsOptional()
  @IsString()
  tokenType?: string;

  @ApiPropertyOptional({ description: 'Filter by blockchain' })
  @IsOptional()
  @IsString()
  blockchain?: string;

  @ApiPropertyOptional({ description: 'Filter by network' })
  @IsOptional()
  @IsString()
  network?: string;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Start date (ISO 8601)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (ISO 8601)' })
  @IsOptional()
  @IsString()
  endDate?: string;
}

/**
 * Credit Naira DTO (V2)
 */
export class CreditNairaDto {
  @ApiProperty({
    description: 'MFA verification code',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  mfaCode: string;

  @ApiProperty({
    description: 'Reason for crediting Naira wallet',
    example: 'Stablecoin deposit converted to Naira',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Exchange reference (if applicable)',
  })
  @IsOptional()
  @IsString()
  exchangeReference?: string;
}

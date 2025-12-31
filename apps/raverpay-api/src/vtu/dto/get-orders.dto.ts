import { IsOptional, IsEnum, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { VTUServiceType, TransactionStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetOrdersDto {
  @ApiPropertyOptional({
    description: 'Filter by VTU service type',
    enum: VTUServiceType,
    example: VTUServiceType.AIRTIME,
  })
  @IsOptional()
  @IsEnum(VTUServiceType)
  serviceType?: VTUServiceType;

  @ApiPropertyOptional({
    description: 'Filter by transaction status',
    enum: TransactionStatus,
    example: TransactionStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiPropertyOptional({
    description: 'Start date (ISO format)',
    example: '2023-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  startDate?: string; // ISO date string

  @ApiPropertyOptional({
    description: 'End date (ISO format)',
    example: '2023-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsString()
  endDate?: string; // ISO date string

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}

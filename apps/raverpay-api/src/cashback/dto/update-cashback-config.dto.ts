import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { VTUServiceType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCashbackConfigDto {
  @ApiPropertyOptional({
    description: 'VTU Service Type',
    enum: VTUServiceType,
  })
  @IsEnum(VTUServiceType)
  @IsOptional()
  serviceType?: VTUServiceType;

  @ApiPropertyOptional({
    description: 'Cashback percentage (0-100)',
    minimum: 0.01,
    maximum: 100,
  })
  @IsNumber()
  @Min(0.01)
  @Max(100)
  @IsOptional()
  percentage?: number;

  @ApiPropertyOptional({
    description: 'Is configuration active?',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Specific provider',
  })
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional({
    description: 'Minimum amount to trigger cashback',
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({
    description: 'Maximum cashback amount cap',
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxCashback?: number;

  @ApiPropertyOptional({
    description: 'Internal description',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

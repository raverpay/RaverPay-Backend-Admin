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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCashbackConfigDto {
  @ApiProperty({
    description: 'VTU Service Type',
    enum: VTUServiceType,
    example: VTUServiceType.DATA,
  })
  @IsEnum(VTUServiceType)
  serviceType: VTUServiceType;

  @ApiProperty({
    description: 'Cashback percentage (0-100)',
    example: 2.5,
    minimum: 0.01,
    maximum: 100,
  })
  @IsNumber()
  @Min(0.01)
  @Max(100)
  percentage: number;

  @ApiPropertyOptional({
    description: 'Is configuration active?',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiPropertyOptional({
    description: 'Specific provider (optional)',
    example: 'glo',
  })
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional({
    description: 'Minimum amount to trigger cashback',
    default: 0,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minAmount?: number = 0;

  @ApiPropertyOptional({
    description: 'Maximum cashback amount cap',
    example: 500,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxCashback?: number;

  @ApiPropertyOptional({
    description: 'Internal description',
    example: 'Weekend promo for Glo Data',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

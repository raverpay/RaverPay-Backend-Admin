import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { VTUServiceType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalculateCashbackDto {
  @ApiProperty({
    description: 'VTU Service Type',
    enum: VTUServiceType,
    example: VTUServiceType.AIRTIME,
  })
  @IsEnum(VTUServiceType)
  serviceType: VTUServiceType;

  @ApiPropertyOptional({
    description: 'Service provider slug (optional)',
    example: 'mtn',
  })
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiProperty({
    description: 'Transaction amount',
    example: 1000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  amount: number;
}

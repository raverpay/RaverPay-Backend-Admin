import { IsString, IsOptional, IsEnum } from 'class-validator';
import { VTUServiceType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSavedRecipientDto {
  @ApiProperty({
    description: 'VTU Service Type',
    enum: VTUServiceType,
    example: VTUServiceType.AIRTIME,
  })
  @IsEnum(VTUServiceType)
  serviceType: VTUServiceType;

  @ApiProperty({
    description: 'Service provider code/slug',
    example: 'MTN',
  })
  @IsString()
  provider: string;

  @ApiProperty({
    description: 'Recipient identifier (phone number, meter number, smartcard)',
    example: '08012345678',
  })
  @IsString()
  recipient: string;

  @ApiPropertyOptional({
    description: 'Friendly name for the recipient',
    example: 'Mom',
  })
  @IsString()
  @IsOptional()
  recipientName?: string;
}

export class UpdateSavedRecipientDto {
  @ApiPropertyOptional({
    description: 'New friendly name for the recipient',
    example: 'Dad',
  })
  @IsString()
  @IsOptional()
  recipientName?: string;
}

export class GetSavedRecipientsDto {
  @ApiPropertyOptional({
    description: 'Filter recipients by service type',
    enum: VTUServiceType,
    example: VTUServiceType.DATA,
  })
  @IsEnum(VTUServiceType)
  @IsOptional()
  serviceType?: VTUServiceType;
}

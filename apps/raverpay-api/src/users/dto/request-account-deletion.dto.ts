import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DeletionReason {
  PRIVACY_CONCERNS = 'privacy_concerns',
  NOT_USEFUL = 'not_useful',
  SWITCHING_SERVICE = 'switching_service',
  TOO_EXPENSIVE = 'too_expensive',
  TECHNICAL_ISSUES = 'technical_issues',
  OTHER = 'other',
}

/**
 * Request Account Deletion DTO
 * Used when a user requests to delete their account
 */
export class RequestAccountDeletionDto {
  @ApiProperty({
    description: 'Current password for verification',
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Reason for account deletion',
    enum: DeletionReason,
    example: DeletionReason.SWITCHING_SERVICE,
  })
  @IsEnum(DeletionReason)
  @IsNotEmpty()
  reason: DeletionReason;

  @ApiPropertyOptional({
    description: 'Custom reason (required if reason is "other")',
    example: 'Not satisfied with the service',
  })
  @IsString()
  @IsOptional()
  customReason?: string; // Required if reason === 'other'
}

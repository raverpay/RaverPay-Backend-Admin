import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating OneSignal push notification token
 */
export class UpdateOneSignalDto {
  @ApiProperty({ description: 'OneSignal Player ID' })
  @IsString()
  oneSignalPlayerId: string; // The subscription/player ID from OneSignal SDK

  @ApiPropertyOptional({ description: 'OneSignal External ID' })
  @IsOptional()
  @IsString()
  oneSignalExternalId?: string; // External user ID (should match userId)
}

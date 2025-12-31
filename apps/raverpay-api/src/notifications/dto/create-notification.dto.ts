import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { NotificationType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Notification Type', enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'Notification Title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification Message' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Notification Data' })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}

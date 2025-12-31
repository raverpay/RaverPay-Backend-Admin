import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsEnum,
} from 'class-validator';
import { SenderType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ description: 'Message Content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Sender Type', enum: SenderType })
  @IsOptional()
  @IsEnum(SenderType)
  senderType?: SenderType;

  @ApiPropertyOptional({ description: 'Attachment URLs', type: [String] })
  @IsOptional()
  @IsArray()
  attachments?: string[];

  @ApiPropertyOptional({ description: 'Message Metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

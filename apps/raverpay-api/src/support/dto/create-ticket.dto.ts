import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TicketPriority } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({ description: 'Linked Conversation ID' })
  @IsString()
  conversationId: string;

  @ApiProperty({ description: 'Ticket Category' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Ticket Title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Ticket Priority', enum: TicketPriority })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;
}

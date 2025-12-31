import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { TicketStatus, TicketPriority } from '@prisma/client';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class UpdateTicketDto {
  @ApiPropertyOptional({ description: 'Ticket Status', enum: TicketStatus })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({ description: 'Ticket Priority', enum: TicketPriority })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({ description: 'Assigned Agent ID' })
  @IsOptional()
  @IsString()
  assignedAgentId?: string;
}

export class AssignTicketDto {
  @ApiProperty({ description: 'Agent ID' })
  @IsString()
  agentId: string;
}

export class ResolveTicketDto {
  @ApiPropertyOptional({ description: 'Resolution Note' })
  @IsOptional()
  @IsString()
  resolutionNote?: string;
}

export class RateConversationDto {
  @ApiProperty({ description: 'Rating (1-5)', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Comment' })
  @IsOptional()
  @IsString()
  comment?: string;
}

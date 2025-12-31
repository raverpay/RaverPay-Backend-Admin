import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCannedResponseDto {
  @ApiProperty({ description: 'Response Title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Response Content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Response Category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Keyboard Shortcut' })
  @IsOptional()
  @IsString()
  shortcut?: string;
}

export class UpdateCannedResponseDto {
  @ApiPropertyOptional({ description: 'Response Title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Response Content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Response Category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Keyboard Shortcut' })
  @IsOptional()
  @IsString()
  shortcut?: string;

  @ApiPropertyOptional({ description: 'Is Active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

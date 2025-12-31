import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHelpCollectionDto {
  @ApiProperty({ description: 'Collection Title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Collection Description' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Icon URL/Name' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Sort Order' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;
}

export class UpdateHelpCollectionDto {
  @ApiPropertyOptional({ description: 'Collection Title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Collection Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Icon URL/Name' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Sort Order' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;

  @ApiPropertyOptional({ description: 'Is Active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateHelpArticleDto {
  @ApiProperty({ description: 'Collection ID' })
  @IsString()
  collectionId: string;

  @ApiProperty({ description: 'Article Title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Article Content' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'URL Slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Sort Order' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;

  @ApiPropertyOptional({ description: 'Is Active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateHelpArticleDto {
  @ApiPropertyOptional({ description: 'Collection ID' })
  @IsOptional()
  @IsString()
  collectionId?: string;

  @ApiPropertyOptional({ description: 'Article Title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Article Content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'URL Slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Sort Order' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;

  @ApiPropertyOptional({ description: 'Is Active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SearchHelpDto {
  @ApiProperty({ description: 'Search Query' })
  @IsString()
  query: string;

  @ApiPropertyOptional({ description: 'Limit results' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number = 10;
}

export class MarkHelpfulDto {
  @ApiProperty({ description: 'Is Helpful?' })
  @IsBoolean()
  helpful: boolean;
}

import {
  IsString,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
  IsNotEmpty,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Prisma } from '@prisma/client';

export class QueryNetworkConfigDto {
  @ApiPropertyOptional({
    description: 'Filter by token type (USDT, USDC)',
    example: 'USDT',
  })
  @IsOptional()
  @IsString()
  tokenType?: string;

  @ApiPropertyOptional({
    description: 'Filter by blockchain (POLYGON, ARBITRUM, BASE)',
    example: 'POLYGON',
  })
  @IsOptional()
  @IsString()
  blockchain?: string;

  @ApiPropertyOptional({
    description: 'Filter by network (mainnet, amoy, sepolia)',
    example: 'mainnet',
  })
  @IsOptional()
  @IsString()
  network?: string;

  @ApiPropertyOptional({
    description: 'Filter by enabled status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by testnet status',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isTestnet?: boolean;
}

export class UpsertNetworkConfigDto {
  @ApiProperty({
    description: 'Token type (USDT, USDC)',
    example: 'USDT',
  })
  @IsNotEmpty()
  @IsString()
  tokenType: string;

  @ApiProperty({
    description: 'Token name',
    example: 'Tether USD',
  })
  @IsNotEmpty()
  @IsString()
  tokenName: string;

  @ApiProperty({
    description: 'Token symbol',
    example: 'USDT',
  })
  @IsNotEmpty()
  @IsString()
  tokenSymbol: string;

  @ApiProperty({
    description: 'Blockchain (POLYGON, ARBITRUM, BASE)',
    example: 'POLYGON',
  })
  @IsNotEmpty()
  @IsString()
  blockchain: string;

  @ApiProperty({
    description: 'Blockchain display name',
    example: 'Polygon',
  })
  @IsNotEmpty()
  @IsString()
  blockchainName: string;

  @ApiProperty({
    description: 'Network (mainnet, amoy, sepolia)',
    example: 'mainnet',
  })
  @IsNotEmpty()
  @IsString()
  network: string;

  @ApiProperty({
    description: 'Network display label',
    example: 'Polygon Mainnet',
  })
  @IsNotEmpty()
  @IsString()
  networkLabel: string;

  @ApiProperty({
    description: 'Whether this is a testnet',
    example: false,
  })
  @IsBoolean()
  isTestnet: boolean;

  @ApiProperty({
    description: 'Whether this network is enabled for users',
    example: true,
  })
  @IsBoolean()
  isEnabled: boolean;

  @ApiProperty({
    description: 'Display order (lower numbers appear first)',
    example: 1,
  })
  @IsInt()
  @Min(0)
  displayOrder: number;

  @ApiProperty({
    description: 'Token contract address',
    example: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  })
  @IsNotEmpty()
  @IsString()
  tokenAddress: string;

  @ApiProperty({
    description: 'Token decimals',
    example: 6,
  })
  @IsInt()
  @Min(0)
  decimals: number;

  @ApiPropertyOptional({
    description: 'Additional metadata (JSON)',
    example: { chainId: 137 },
  })
  @IsOptional()
  @IsObject()
  metadata?: Prisma.InputJsonValue;
}

export class ToggleNetworkDto {
  @ApiProperty({
    description: 'Whether to enable or disable the network',
    example: true,
  })
  @IsBoolean()
  isEnabled: boolean;
}

export class NetworkConfigParamsDto {
  @ApiProperty({
    description: 'Token type',
    example: 'USDT',
  })
  @IsNotEmpty()
  @IsString()
  tokenType: string;

  @ApiProperty({
    description: 'Blockchain',
    example: 'POLYGON',
  })
  @IsNotEmpty()
  @IsString()
  blockchain: string;

  @ApiProperty({
    description: 'Network',
    example: 'mainnet',
  })
  @IsNotEmpty()
  @IsString()
  network: string;
}

// Empty DTO - delete only needs URL params and ReAuth token
export class DeleteNetworkDto {}

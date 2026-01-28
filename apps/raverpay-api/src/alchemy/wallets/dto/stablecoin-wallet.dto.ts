import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUrl,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Token Type Enum
 */
export enum StablecoinTokenType {
  USDT = 'USDT',
  USDC = 'USDC',
}

/**
 * Blockchain Enum
 */
export enum StablecoinBlockchain {
  ETHEREUM = 'ETHEREUM',
  POLYGON = 'POLYGON',
  ARBITRUM = 'ARBITRUM',
  BSC = 'BSC',
  SOLANA = 'SOLANA',
}

/**
 * Network Enum
 */
export enum StablecoinNetwork {
  MAINNET = 'mainnet',
  SEPOLIA = 'sepolia',
  MUMBAI = 'mumbai',
  AMOY = 'amoy',
  BSC_TESTNET = 'bsc-testnet',
  SOLANA_DEVNET = 'solana-devnet',
}

/**
 * Monthly Income Range Enum
 */
export enum MonthlyIncomeRange {
  UNDER_100K = 'Under ₦100,000',
  BETWEEN_100K_500K = '₦100,000 - ₦500,000',
  BETWEEN_500K_2M = '₦500,000 - ₦2,000,000',
  BETWEEN_2M_5M = '₦2,000,000 - ₦5,000,000',
  ABOVE_5M = 'Above ₦5,000,000',
}

/**
 * Create Stablecoin Wallet DTO
 */
export class CreateStablecoinWalletDto {
  @ApiProperty({
    description: 'Token type',
    example: 'USDC',
    enum: StablecoinTokenType,
  })
  @IsEnum(StablecoinTokenType)
  @IsNotEmpty()
  tokenType: StablecoinTokenType;

  @ApiProperty({
    description: 'Blockchain network',
    example: 'ETHEREUM',
    enum: StablecoinBlockchain,
  })
  @IsEnum(StablecoinBlockchain)
  @IsNotEmpty()
  blockchain: StablecoinBlockchain;

  @ApiProperty({
    description: 'Network (mainnet or testnet)',
    example: 'mainnet',
    enum: StablecoinNetwork,
  })
  @IsEnum(StablecoinNetwork)
  @IsNotEmpty()
  network: StablecoinNetwork;

  @ApiProperty({
    description: 'Monthly income range',
    example: MonthlyIncomeRange.BETWEEN_100K_500K,
    enum: MonthlyIncomeRange,
  })
  @IsEnum(MonthlyIncomeRange)
  @IsNotEmpty()
  monthlyIncomeRange: MonthlyIncomeRange;

  @ApiProperty({
    description: 'Bank statement URL (Cloudinary)',
    example:
      'https://res.cloudinary.com/example/image/upload/v123/bank-statement.pdf',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  bankStatementUrl: string;

  @ApiProperty({
    description: 'Terms and conditions accepted',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  termsAccepted: boolean;
}

/**
 * Stablecoin Wallet Response DTO
 */
export class StablecoinWalletResponseDto {
  @ApiProperty({
    description: 'Stablecoin wallet ID',
    example: 'cuid-123',
  })
  id: string;

  @ApiProperty({
    description: 'Wallet address (same for all networks)',
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  })
  address: string;

  @ApiProperty({
    description: 'Token type',
    example: 'USDC',
    enum: StablecoinTokenType,
  })
  tokenType: StablecoinTokenType;

  @ApiProperty({
    description: 'Blockchain',
    example: 'ETHEREUM',
    enum: StablecoinBlockchain,
  })
  blockchain: StablecoinBlockchain;

  @ApiProperty({
    description: 'Network',
    example: 'mainnet',
    enum: StablecoinNetwork,
  })
  network: StablecoinNetwork;

  @ApiPropertyOptional({
    description: 'QR code (base64 or URL)',
    example: 'data:image/png;base64,iVBORw0KG...',
  })
  qrCode?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2026-01-28T12:00:00.000Z',
  })
  createdAt: Date;
}

/**
 * Get Stablecoin Wallets Query DTO
 */
export class GetStablecoinWalletsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by token type',
    enum: StablecoinTokenType,
  })
  @IsEnum(StablecoinTokenType)
  @IsOptional()
  tokenType?: StablecoinTokenType;

  @ApiPropertyOptional({
    description: 'Filter by blockchain',
    enum: StablecoinBlockchain,
  })
  @IsEnum(StablecoinBlockchain)
  @IsOptional()
  blockchain?: StablecoinBlockchain;

  @ApiPropertyOptional({
    description: 'Filter by network',
    enum: StablecoinNetwork,
  })
  @IsEnum(StablecoinNetwork)
  @IsOptional()
  network?: StablecoinNetwork;
}

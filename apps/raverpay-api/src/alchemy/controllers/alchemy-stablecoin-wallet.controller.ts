import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { StablecoinWalletService } from '../wallets/stablecoin-wallet.service';
import {
  CreateStablecoinWalletDto,
  StablecoinWalletResponseDto,
  GetStablecoinWalletsQueryDto,
  StablecoinTokenType,
  StablecoinBlockchain,
  StablecoinNetwork,
} from '../wallets/dto/stablecoin-wallet.dto';
import { AlchemyConfigService } from '../config/alchemy-config.service';

/**
 * Alchemy Stablecoin Wallet Controller
 *
 * Manages stablecoin wallet endpoints
 * All endpoints require authentication
 */
@ApiTags('Alchemy Stablecoin Wallets')
@Controller('alchemy/wallets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlchemyStablecoinWalletController {
  private readonly logger = new Logger(AlchemyStablecoinWalletController.name);

  constructor(
    private readonly stablecoinWalletService: StablecoinWalletService,
    private readonly alchemyConfigService: AlchemyConfigService,
  ) {}

  /**
   * Get supported networks for stablecoins
   */
  @Get('stablecoin/networks')
  @ApiOperation({
    summary: 'Get supported networks for stablecoins',
    description:
      'Returns available tokens, blockchains, and networks for stablecoin wallets',
  })
  @ApiResponse({
    status: 200,
    description: 'Supported networks retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            tokens: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', example: 'USDT' },
                  name: { type: 'string', example: 'Tether USD' },
                  symbol: { type: 'string', example: 'USDT' },
                  blockchains: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        blockchain: { type: 'string', example: 'POLYGON' },
                        name: { type: 'string', example: 'Polygon' },
                        networks: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              network: { type: 'string', example: 'mainnet' },
                              label: {
                                type: 'string',
                                example: 'Polygon Mainnet',
                              },
                              isTestnet: { type: 'boolean', example: false },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async getSupportedNetworks() {
    try {
      const networks = {
        tokens: [
          {
            type: 'USDT',
            name: 'Tether USD',
            symbol: 'USDT',
            blockchains: [
              {
                blockchain: 'POLYGON',
                name: 'Polygon',
                networks: [
                  {
                    network: 'mainnet',
                    label: 'Polygon Mainnet',
                    isTestnet: false,
                  },
                  {
                    network: 'amoy',
                    label: 'Polygon Amoy Testnet',
                    isTestnet: true,
                  },
                ],
              },
              {
                blockchain: 'ARBITRUM',
                name: 'Arbitrum',
                networks: [
                  {
                    network: 'mainnet',
                    label: 'Arbitrum Mainnet',
                    isTestnet: false,
                  },
                  {
                    network: 'sepolia',
                    label: 'Arbitrum Sepolia',
                    isTestnet: true,
                  },
                ],
              },
              {
                blockchain: 'BASE',
                name: 'Base',
                networks: [
                  {
                    network: 'mainnet',
                    label: 'Base Mainnet',
                    isTestnet: false,
                  },
                  {
                    network: 'sepolia',
                    label: 'Base Sepolia',
                    isTestnet: true,
                  },
                ],
              },
            ],
          },
          {
            type: 'USDC',
            name: 'USD Coin',
            symbol: 'USDC',
            blockchains: [
              {
                blockchain: 'POLYGON',
                name: 'Polygon',
                networks: [
                  {
                    network: 'mainnet',
                    label: 'Polygon Mainnet',
                    isTestnet: false,
                  },
                  {
                    network: 'amoy',
                    label: 'Polygon Amoy Testnet',
                    isTestnet: true,
                  },
                ],
              },
              {
                blockchain: 'ARBITRUM',
                name: 'Arbitrum',
                networks: [
                  {
                    network: 'mainnet',
                    label: 'Arbitrum Mainnet',
                    isTestnet: false,
                  },
                  {
                    network: 'sepolia',
                    label: 'Arbitrum Sepolia',
                    isTestnet: true,
                  },
                ],
              },
              {
                blockchain: 'BASE',
                name: 'Base',
                networks: [
                  {
                    network: 'mainnet',
                    label: 'Base Mainnet',
                    isTestnet: false,
                  },
                  {
                    network: 'sepolia',
                    label: 'Base Sepolia',
                    isTestnet: true,
                  },
                ],
              },
            ],
          },
        ],
      };

      return {
        success: true,
        data: networks,
      };
    } catch (error) {
      this.logger.error(
        `Error getting supported networks: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Create stablecoin wallet
   */
  @Post('create-stablecoin-wallet')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create or get stablecoin wallet',
    description:
      'Creates a stablecoin wallet configuration. If user already has an AlchemyWallet, returns the same address. If StablecoinWallet already exists for this token/network, returns existing.',
  })
  @ApiResponse({
    status: 201,
    description: 'Stablecoin wallet created or retrieved successfully',
    type: StablecoinWalletResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 409, description: 'Wallet already exists' })
  async createStablecoinWallet(
    @Body() dto: CreateStablecoinWalletDto,
    @Request() req: { user: { id: string } },
  ) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new Error('User ID not found in request');
      }

      const wallet = await this.stablecoinWalletService.createStablecoinWallet(
        dto,
        userId,
      );

      this.logger.log(
        `User ${userId} created/retrieved stablecoin wallet ${wallet.id} for ${dto.tokenType} on ${dto.blockchain}-${dto.network}`,
      );

      return {
        success: true,
        data: wallet,
      };
    } catch (error) {
      this.logger.error(
        `Error creating stablecoin wallet: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get all stablecoin wallets for authenticated user
   */
  @Get('stablecoin')
  @ApiOperation({
    summary: 'Get all stablecoin wallets for authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Stablecoin wallets retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'cuid-123',
            address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            tokenType: 'USDC',
            blockchain: 'ETHEREUM',
            network: 'mainnet',
            qrCode: 'data:image/png;base64,...',
            createdAt: '2026-01-28T12:00:00.000Z',
          },
        ],
        count: 1,
      },
    },
  })
  async getStablecoinWallets(
    @Query() query: GetStablecoinWalletsQueryDto,
    @Request() req: { user: { id: string } },
  ) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new Error('User ID not found in request');
      }

      const wallets = await this.stablecoinWalletService.getStablecoinWallets(
        userId,
        query,
      );

      return {
        success: true,
        data: wallets,
        count: wallets.length,
      };
    } catch (error) {
      this.logger.error(
        `Error getting stablecoin wallets: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get stablecoin wallet by ID
   */
  @Get('stablecoin/:walletId')
  @ApiOperation({ summary: 'Get stablecoin wallet by ID' })
  @ApiParam({ name: 'walletId', description: 'Stablecoin wallet ID' })
  @ApiResponse({
    status: 200,
    description: 'Stablecoin wallet retrieved successfully',
    type: StablecoinWalletResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getStablecoinWalletById(
    @Param('walletId') walletId: string,
    @Request() req: { user: { id: string } },
  ) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new Error('User ID not found in request');
      }

      const wallet = await this.stablecoinWalletService.getStablecoinWalletById(
        walletId,
        userId,
      );

      return {
        success: true,
        data: wallet,
      };
    } catch (error) {
      this.logger.error(
        `Error getting stablecoin wallet: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get stablecoin wallet by token/blockchain/network
   */
  @Get('stablecoin/by-token/:tokenType/:blockchain/:network')
  @ApiOperation({
    summary: 'Get stablecoin wallet by token type, blockchain, and network',
    description:
      'Returns the same wallet address regardless of token/network selection',
  })
  @ApiParam({
    name: 'tokenType',
    description: 'Token type',
    enum: StablecoinTokenType,
  })
  @ApiParam({
    name: 'blockchain',
    description: 'Blockchain',
    enum: StablecoinBlockchain,
  })
  @ApiParam({
    name: 'network',
    description: 'Network',
    enum: StablecoinNetwork,
  })
  @ApiResponse({
    status: 200,
    description: 'Stablecoin wallet retrieved successfully',
    type: StablecoinWalletResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async getStablecoinWalletByToken(
    @Param('tokenType') tokenType: StablecoinTokenType,
    @Param('blockchain') blockchain: StablecoinBlockchain,
    @Param('network') network: StablecoinNetwork,
    @Request() req: { user: { id: string } },
  ) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new Error('User ID not found in request');
      }

      const wallet =
        await this.stablecoinWalletService.getStablecoinWalletByToken(
          userId,
          tokenType,
          blockchain,
          network,
        );

      return {
        success: true,
        data: wallet,
        message: `Send ${tokenType} on ${blockchain} ${network} to this address`,
      };
    } catch (error) {
      this.logger.error(
        `Error getting stablecoin wallet by token: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}

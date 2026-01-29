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
import { AlchemyNetworkConfigService } from '../config/alchemy-network-config.service';

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
    private readonly networkConfigService: AlchemyNetworkConfigService,
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
      const groupedConfigs =
        await this.networkConfigService.getEnabledNetworksGrouped();

      const networks = {
        tokens: groupedConfigs.map((config) => ({
          type: config.tokenType,
          name: config.tokenSymbol === 'USDT' ? 'Tether USD' : 'USD Coin',
          symbol: config.tokenSymbol,
          blockchains: config.blockchains.map((blockchain) => ({
            blockchain: blockchain.blockchain,
            name: blockchain.blockchainName,
            networks: blockchain.networks.map((network) => ({
              network: network.network,
              label: network.networkLabel,
              isTestnet: network.isTestnet,
            })),
          })),
        })),
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

  /**
   * Get all stablecoin wallets for the authenticated user (list endpoint for balance fetching)
   */
  @Get('stablecoin/list')
  @ApiOperation({
    summary: 'Get all stablecoin wallets list',
    description: 'Returns all stablecoin wallets for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Stablecoin wallets retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              address: { type: 'string' },
              tokenType: { type: 'string' },
              blockchain: { type: 'string' },
              network: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getStablecoinWalletsList(@Request() req: { user: { id: string } }) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new Error('User ID not found in request');
      }

      const wallets = await this.stablecoinWalletService.getStablecoinWallets(
        userId,
        {},
      );

      return {
        success: true,
        data: wallets,
      };
    } catch (error) {
      this.logger.error(
        `Error getting stablecoin wallets list: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get token balance for a specific wallet
   */
  @Post('stablecoin/balance')
  @ApiOperation({
    summary: 'Get token balance',
    description:
      'Returns the balance for a specific token on a specific blockchain/network',
  })
  @ApiResponse({
    status: 200,
    description: 'Token balance retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            balance: { type: 'string', example: '100000000' },
            balanceUSD: { type: 'number', example: 100.0 },
            decimals: { type: 'number', example: 6 },
            tokenAddress: { type: 'string' },
          },
        },
      },
    },
  })
  async getTokenBalance(
    @Body()
    body: {
      address: string;
      tokenType: StablecoinTokenType;
      blockchain: StablecoinBlockchain;
      network: StablecoinNetwork;
    },
    @Request() req: { user: { id: string } },
  ) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new Error('User ID not found in request');
      }

      // Get network config to get token address
      const networkConfig = await this.networkConfigService.getNetworkConfig(
        body.tokenType,
        body.blockchain,
        body.network,
      );

      if (!networkConfig || !networkConfig.tokenAddress) {
        throw new Error(
          `Token address not found for ${body.tokenType} on ${body.blockchain}-${body.network}`,
        );
      }

      // Get Alchemy config based on blockchain and network
      const chainId =
        body.blockchain === 'POLYGON' && body.network === 'mainnet'
          ? 137
          : body.blockchain === 'POLYGON' && body.network === 'amoy'
            ? 80002
            : body.blockchain === 'ARBITRUM' && body.network === 'mainnet'
              ? 42161
              : body.blockchain === 'ARBITRUM' && body.network === 'sepolia'
                ? 421614
                : body.blockchain === 'BASE' && body.network === 'mainnet'
                  ? 8453
                  : 84532; // Base Sepolia

      const rpcUrl = this.alchemyConfigService.getAlchemyRpcUrl(
        body.blockchain,
        body.network,
      );

      // Fetch balance using viem
      const { createPublicClient, http, formatUnits } = await import('viem');

      // ERC20 ABI for balanceOf function
      const ERC20_ABI = [
        {
          inputs: [{ name: 'owner', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
      ] as const;

      // Create public client
      const publicClient = createPublicClient({
        transport: http(rpcUrl),
      });

      // Get token balance
      const balance = await publicClient.readContract({
        address: networkConfig.tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [body.address as `0x${string}`],
      });

      // Convert BigInt to decimal string (raw balance)
      const balanceDecimal = balance.toString();

      // Format balance with decimals using viem's formatUnits
      const balanceFormatted = formatUnits(balance, networkConfig.decimals);

      // Convert to USD (assuming 1:1 for stablecoins)
      const balanceUSD = parseFloat(balanceFormatted);

      return {
        success: true,
        data: {
          balance: balanceDecimal,
          balanceFormatted,
          balanceUSD,
          decimals: networkConfig.decimals,
          tokenAddress: networkConfig.tokenAddress,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error getting token balance: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}

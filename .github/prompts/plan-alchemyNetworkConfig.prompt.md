# Comprehensive Plan: Database-Driven Network Configuration

## Phase 1: Database Schema & Migration

### Step 1.1: Create Prisma Model

**File:** `apps/raverpay-api/prisma/schema.prisma`

Add this model after `StablecoinDeposit`:

```prisma
// Alchemy Network Configuration - Controls which networks are available
model AlchemyNetworkConfig {
  id              String   @id @default(cuid())
  tokenType       String   // 'USDT' | 'USDC'
  tokenName       String   // 'Tether USD' | 'USD Coin'
  tokenSymbol     String   // 'USDT' | 'USDC'
  blockchain      String   // 'POLYGON' | 'ARBITRUM' | 'BASE'
  blockchainName  String   // 'Polygon' | 'Arbitrum' | 'Base'
  network         String   // 'mainnet' | 'amoy' | 'sepolia'
  networkLabel    String   // 'Polygon Mainnet' | 'Base Sepolia'
  isTestnet       Boolean  @default(false)
  isEnabled       Boolean  @default(true)
  displayOrder    Int      @default(0) // For sorting in UI
  tokenAddress    String?  // ERC20 contract address for this token on this network
  decimals        Int      @default(6) // Token decimals (USDC/USDT = 6)
  metadata        Json?    // Additional network-specific config
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String?  // Admin user ID who created
  updatedBy       String?  // Admin user ID who last updated

  @@unique([tokenType, blockchain, network])
  @@index([isEnabled])
  @@index([tokenType])
  @@index([blockchain])
  @@index([network])
  @@index([displayOrder])
  @@map("alchemy_network_config")
}
```

### Step 1.2: Create Migration

```bash
cd apps/raverpay-api
pnpm prisma migrate dev --name add_alchemy_network_config
```

### Step 1.3: Seed Initial Data

**File:** `apps/raverpay-api/prisma/seeds/alchemy-network-config.seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedNetworkConfig() {
  const configs = [
    // USDT - Polygon
    {
      tokenType: 'USDT',
      tokenName: 'Tether USD',
      tokenSymbol: 'USDT',
      blockchain: 'POLYGON',
      blockchainName: 'Polygon',
      network: 'mainnet',
      networkLabel: 'Polygon Mainnet',
      isTestnet: false,
      isEnabled: true,
      displayOrder: 1,
      tokenAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT on Polygon
      decimals: 6,
    },
    {
      tokenType: 'USDT',
      tokenName: 'Tether USD',
      tokenSymbol: 'USDT',
      blockchain: 'POLYGON',
      blockchainName: 'Polygon',
      network: 'amoy',
      networkLabel: 'Polygon Amoy Testnet',
      isTestnet: true,
      isEnabled: true,
      displayOrder: 2,
      tokenAddress: '0x...', // USDT on Amoy testnet
      decimals: 6,
    },
    // USDT - Arbitrum
    {
      tokenType: 'USDT',
      tokenName: 'Tether USD',
      tokenSymbol: 'USDT',
      blockchain: 'ARBITRUM',
      blockchainName: 'Arbitrum',
      network: 'mainnet',
      networkLabel: 'Arbitrum Mainnet',
      isTestnet: false,
      isEnabled: true,
      displayOrder: 3,
      tokenAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT on Arbitrum
      decimals: 6,
    },
    {
      tokenType: 'USDT',
      tokenName: 'Tether USD',
      tokenSymbol: 'USDT',
      blockchain: 'ARBITRUM',
      blockchainName: 'Arbitrum',
      network: 'sepolia',
      networkLabel: 'Arbitrum Sepolia',
      isTestnet: true,
      isEnabled: true,
      displayOrder: 4,
      tokenAddress: '0x...', // USDT on Arbitrum Sepolia
      decimals: 6,
    },
    // USDT - Base
    {
      tokenType: 'USDT',
      tokenName: 'Tether USD',
      tokenSymbol: 'USDT',
      blockchain: 'BASE',
      blockchainName: 'Base',
      network: 'mainnet',
      networkLabel: 'Base Mainnet',
      isTestnet: false,
      isEnabled: true,
      displayOrder: 5,
      tokenAddress: '0x...', // USDT on Base (if available)
      decimals: 6,
    },
    {
      tokenType: 'USDT',
      tokenName: 'Tether USD',
      tokenSymbol: 'USDT',
      blockchain: 'BASE',
      blockchainName: 'Base',
      network: 'sepolia',
      networkLabel: 'Base Sepolia',
      isTestnet: true,
      isEnabled: true,
      displayOrder: 6,
      tokenAddress: '0x...', // USDT on Base Sepolia
      decimals: 6,
    },
    // USDC - Polygon
    {
      tokenType: 'USDC',
      tokenName: 'USD Coin',
      tokenSymbol: 'USDC',
      blockchain: 'POLYGON',
      blockchainName: 'Polygon',
      network: 'mainnet',
      networkLabel: 'Polygon Mainnet',
      isTestnet: false,
      isEnabled: true,
      displayOrder: 7,
      tokenAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // USDC on Polygon (Native)
      decimals: 6,
    },
    {
      tokenType: 'USDC',
      tokenName: 'USD Coin',
      tokenSymbol: 'USDC',
      blockchain: 'POLYGON',
      blockchainName: 'Polygon',
      network: 'amoy',
      networkLabel: 'Polygon Amoy Testnet',
      isTestnet: true,
      isEnabled: true,
      displayOrder: 8,
      tokenAddress: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', // USDC on Amoy
      decimals: 6,
    },
    // USDC - Arbitrum
    {
      tokenType: 'USDC',
      tokenName: 'USD Coin',
      tokenSymbol: 'USDC',
      blockchain: 'ARBITRUM',
      blockchainName: 'Arbitrum',
      network: 'mainnet',
      networkLabel: 'Arbitrum Mainnet',
      isTestnet: false,
      isEnabled: true,
      displayOrder: 9,
      tokenAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC on Arbitrum (Native)
      decimals: 6,
    },
    {
      tokenType: 'USDC',
      tokenName: 'USD Coin',
      tokenSymbol: 'USDC',
      blockchain: 'ARBITRUM',
      blockchainName: 'Arbitrum',
      network: 'sepolia',
      networkLabel: 'Arbitrum Sepolia',
      isTestnet: true,
      isEnabled: true,
      displayOrder: 10,
      tokenAddress: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // USDC on Arbitrum Sepolia
      decimals: 6,
    },
    // USDC - Base
    {
      tokenType: 'USDC',
      tokenName: 'USD Coin',
      tokenSymbol: 'USDC',
      blockchain: 'BASE',
      blockchainName: 'Base',
      network: 'mainnet',
      networkLabel: 'Base Mainnet',
      isTestnet: false,
      isEnabled: true,
      displayOrder: 11,
      tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
      decimals: 6,
    },
    {
      tokenType: 'USDC',
      tokenName: 'USD Coin',
      tokenSymbol: 'USDC',
      blockchain: 'BASE',
      blockchainName: 'Base',
      network: 'sepolia',
      networkLabel: 'Base Sepolia',
      isTestnet: true,
      isEnabled: true,
      displayOrder: 12,
      tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
      decimals: 6,
    },
  ];

  for (const config of configs) {
    await prisma.alchemyNetworkConfig.upsert({
      where: {
        tokenType_blockchain_network: {
          tokenType: config.tokenType,
          blockchain: config.blockchain,
          network: config.network,
        },
      },
      update: config,
      create: config,
    });
  }

  console.log('✅ Alchemy Network Config seeded successfully');
}

seedNetworkConfig()
  .catch((e) => {
    console.error('❌ Error seeding network config:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

**Run seed:**

```bash
cd apps/raverpay-api
npx ts-node prisma/seeds/alchemy-network-config.seed.ts
```

---

## Phase 2: Backend Service Layer

### Step 2.1: Create Network Config Service

**File:** `apps/raverpay-api/src/alchemy/config/alchemy-network-config.service.ts`

```typescript
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface NetworkConfigQuery {
  tokenType?: string;
  blockchain?: string;
  network?: string;
  isEnabled?: boolean;
  isTestnet?: boolean;
}

@Injectable()
export class AlchemyNetworkConfigService {
  private readonly logger = new Logger(AlchemyNetworkConfigService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all network configurations with optional filters
   */
  async getNetworkConfigs(query: NetworkConfigQuery = {}) {
    return this.prisma.alchemyNetworkConfig.findMany({
      where: {
        tokenType: query.tokenType,
        blockchain: query.blockchain,
        network: query.network,
        isEnabled: query.isEnabled,
        isTestnet: query.isTestnet,
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  /**
   * Get enabled networks grouped by token
   */
  async getEnabledNetworksGrouped() {
    const configs = await this.prisma.alchemyNetworkConfig.findMany({
      where: { isEnabled: true },
      orderBy: { displayOrder: 'asc' },
    });

    // Group by token type
    const grouped = configs.reduce((acc, config) => {
      if (!acc[config.tokenType]) {
        acc[config.tokenType] = {
          type: config.tokenType,
          name: config.tokenName,
          symbol: config.tokenSymbol,
          blockchains: [],
        };
      }

      // Find or create blockchain entry
      let blockchain = acc[config.tokenType].blockchains.find(
        (b) => b.blockchain === config.blockchain,
      );

      if (!blockchain) {
        blockchain = {
          blockchain: config.blockchain,
          name: config.blockchainName,
          networks: [],
        };
        acc[config.tokenType].blockchains.push(blockchain);
      }

      // Add network
      blockchain.networks.push({
        network: config.network,
        label: config.networkLabel,
        isTestnet: config.isTestnet,
        tokenAddress: config.tokenAddress,
        decimals: config.decimals,
      });

      return acc;
    }, {});

    return Object.values(grouped);
  }

  /**
   * Get network config by unique key
   */
  async getNetworkConfig(tokenType: string, blockchain: string, network: string) {
    const config = await this.prisma.alchemyNetworkConfig.findUnique({
      where: {
        tokenType_blockchain_network: {
          tokenType,
          blockchain,
          network,
        },
      },
    });

    if (!config) {
      throw new NotFoundException(
        `Network config not found for ${tokenType} on ${blockchain}-${network}`,
      );
    }

    return config;
  }

  /**
   * Check if a network is enabled
   */
  async isNetworkEnabled(tokenType: string, blockchain: string, network: string): Promise<boolean> {
    const config = await this.prisma.alchemyNetworkConfig.findUnique({
      where: {
        tokenType_blockchain_network: {
          tokenType,
          blockchain,
          network,
        },
      },
      select: { isEnabled: true },
    });

    return config?.isEnabled ?? false;
  }

  /**
   * Create or update network config
   */
  async upsertNetworkConfig(data: any, adminUserId: string) {
    return this.prisma.alchemyNetworkConfig.upsert({
      where: {
        tokenType_blockchain_network: {
          tokenType: data.tokenType,
          blockchain: data.blockchain,
          network: data.network,
        },
      },
      update: {
        ...data,
        updatedBy: adminUserId,
      },
      create: {
        ...data,
        createdBy: adminUserId,
        updatedBy: adminUserId,
      },
    });
  }

  /**
   * Enable/disable network
   */
  async toggleNetwork(
    tokenType: string,
    blockchain: string,
    network: string,
    isEnabled: boolean,
    adminUserId: string,
  ) {
    return this.prisma.alchemyNetworkConfig.update({
      where: {
        tokenType_blockchain_network: {
          tokenType,
          blockchain,
          network,
        },
      },
      data: {
        isEnabled,
        updatedBy: adminUserId,
      },
    });
  }

  /**
   * Delete network config
   */
  async deleteNetworkConfig(tokenType: string, blockchain: string, network: string) {
    return this.prisma.alchemyNetworkConfig.delete({
      where: {
        tokenType_blockchain_network: {
          tokenType,
          blockchain,
          network,
        },
      },
    });
  }
}
```

### Step 2.2: Update Stablecoin Wallet Controller

**File:** `apps/raverpay-api/src/alchemy/controllers/alchemy-stablecoin-wallet.controller.ts`

Replace the hardcoded `getSupportedNetworks()` method:

```typescript
@Get('stablecoin/networks')
@ApiOperation({
  summary: 'Get supported networks for stablecoins',
  description: 'Returns available tokens, blockchains, and networks for stablecoin wallets',
})
@ApiResponse({ status: 200, description: 'Supported networks retrieved successfully' })
async getSupportedNetworks() {
  try {
    const tokens = await this.networkConfigService.getEnabledNetworksGrouped();

    return {
      success: true,
      data: { tokens },
    };
  } catch (error) {
    this.logger.error(`Error getting supported networks: ${error.message}`, error.stack);
    throw error;
  }
}
```

Add dependency injection in constructor:

```typescript
constructor(
  private readonly stablecoinWalletService: StablecoinWalletService,
  private readonly networkConfigService: AlchemyNetworkConfigService,
) {}
```

### Step 2.3: Create Network Config Module

**File:** `apps/raverpay-api/src/alchemy/config/alchemy-network-config.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AlchemyNetworkConfigService } from './alchemy-network-config.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AlchemyNetworkConfigService],
  exports: [AlchemyNetworkConfigService],
})
export class AlchemyNetworkConfigModule {}
```

### Step 2.4: Update Alchemy Module

**File:** `apps/raverpay-api/src/alchemy/alchemy.module.ts`

Add the network config module to imports:

```typescript
import { AlchemyNetworkConfigModule } from './config/alchemy-network-config.module';

@Module({
  imports: [
    PrismaModule,
    AlchemyNetworkConfigModule, // ADD THIS
    // ... other imports
  ],
  // ... rest of module
})
export class AlchemyModule {}
```

### Step 2.5: Update Stablecoin Wallet Controller

**File:** `apps/raverpay-api/src/alchemy/controllers/alchemy-stablecoin-wallet.controller.ts`

Replace the hardcoded `getSupportedNetworks()` method and add dependency injection:

```typescript
import { AlchemyNetworkConfigService } from '../config/alchemy-network-config.service';

@Controller('alchemy/wallets')
export class AlchemyStablecoinWalletController {
  constructor(
    private readonly stablecoinWalletService: StablecoinWalletService,
    private readonly networkConfigService: AlchemyNetworkConfigService, // ADD THIS
  ) {}

  @Get('stablecoin/networks')
  @ApiOperation({
    summary: 'Get supported networks for stablecoins',
    description: 'Returns available tokens, blockchains, and networks for stablecoin wallets',
  })
  @ApiResponse({ status: 200, description: 'Supported networks retrieved successfully' })
  async getSupportedNetworks() {
    try {
      const tokens = await this.networkConfigService.getEnabledNetworksGrouped();

      return {
        success: true,
        data: { tokens },
      };
    } catch (error) {
      this.logger.error(`Error getting supported networks: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

### Step 2.6: Add Validation Middleware

**File:** `apps/raverpay-api/src/alchemy/wallets/stablecoin-wallet.service.ts`

Add network config service injection and validation before wallet creation:

```typescript
import { AlchemyNetworkConfigService } from '../config/alchemy-network-config.service';

@Injectable()
export class StablecoinWalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly networkConfigService: AlchemyNetworkConfigService, // ADD THIS
    // ... other dependencies
  ) {}

  async createStablecoinWallet(dto: CreateStablecoinWalletDto, userId: string) {
    // Validate network is enabled
    const isEnabled = await this.networkConfigService.isNetworkEnabled(
      dto.tokenType,
      dto.blockchain,
      dto.network,
    );

    if (!isEnabled) {
      throw new BadRequestException(
        `Network ${dto.blockchain}-${dto.network} is not available for ${dto.tokenType}`,
      );
    }

    // Continue with wallet creation...
  }
}
```

---

## Phase 3: Admin API & Service Integration

### Step 3.1: Create Admin Network Config Controller

**File:** `apps/raverpay-api/src/admin/alchemy/network-config/admin-network-config.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AlchemyNetworkConfigService } from '../../../alchemy/config/alchemy-network-config.service';
import {
  UpsertNetworkConfigDto,
  QueryNetworkConfigDto,
  ToggleNetworkDto,
} from './admin-network-config.dto';

@ApiTags('Admin - Alchemy Network Config')
@ApiBearerAuth('JWT-auth')
@Controller('admin/alchemy/network-config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminNetworkConfigController {
  constructor(private readonly networkConfigService: AlchemyNetworkConfigService) {}

  @ApiOperation({ summary: 'Get all network configurations' })
  @Get()
  async getAllConfigs(@Query() query: QueryNetworkConfigDto) {
    const configs = await this.networkConfigService.getNetworkConfigs(query);
    return {
      success: true,
      data: configs,
      count: configs.length,
    };
  }

  @ApiOperation({ summary: 'Get enabled networks grouped by token' })
  @Get('grouped')
  async getGroupedConfigs() {
    const grouped = await this.networkConfigService.getEnabledNetworksGrouped();
    return {
      success: true,
      data: { tokens: grouped },
    };
  }

  @ApiOperation({ summary: 'Get specific network config' })
  @ApiParam({ name: 'tokenType', example: 'USDC' })
  @ApiParam({ name: 'blockchain', example: 'POLYGON' })
  @ApiParam({ name: 'network', example: 'mainnet' })
  @Get(':tokenType/:blockchain/:network')
  async getConfig(
    @Param('tokenType') tokenType: string,
    @Param('blockchain') blockchain: string,
    @Param('network') network: string,
  ) {
    const config = await this.networkConfigService.getNetworkConfig(tokenType, blockchain, network);
    return {
      success: true,
      data: config,
    };
  }

  @ApiOperation({ summary: 'Create or update network config' })
  @ApiBody({ type: UpsertNetworkConfigDto })
  @Post()
  async upsertConfig(
    @Body() dto: UpsertNetworkConfigDto,
    @Request() req: { user: { id: string } },
  ) {
    const config = await this.networkConfigService.upsertNetworkConfig(dto, req.user.id);
    return {
      success: true,
      data: config,
      message: 'Network configuration saved successfully',
    };
  }

  @ApiOperation({ summary: 'Enable/disable network' })
  @ApiParam({ name: 'tokenType', example: 'USDC' })
  @ApiParam({ name: 'blockchain', example: 'POLYGON' })
  @ApiParam({ name: 'network', example: 'mainnet' })
  @ApiBody({ type: ToggleNetworkDto })
  @Patch(':tokenType/:blockchain/:network/toggle')
  async toggleNetwork(
    @Param('tokenType') tokenType: string,
    @Param('blockchain') blockchain: string,
    @Param('network') network: string,
    @Body() dto: ToggleNetworkDto,
    @Request() req: { user: { id: string } },
  ) {
    const config = await this.networkConfigService.toggleNetwork(
      tokenType,
      blockchain,
      network,
      dto.isEnabled,
      req.user.id,
    );
    return {
      success: true,
      data: config,
      message: `Network ${dto.isEnabled ? 'enabled' : 'disabled'} successfully`,
    };
  }

  @ApiOperation({ summary: 'Delete network config' })
  @ApiParam({ name: 'tokenType', example: 'USDC' })
  @ApiParam({ name: 'blockchain', example: 'POLYGON' })
  @ApiParam({ name: 'network', example: 'mainnet' })
  @Delete(':tokenType/:blockchain/:network')
  async deleteConfig(
    @Param('tokenType') tokenType: string,
    @Param('blockchain') blockchain: string,
    @Param('network') network: string,
  ) {
    await this.networkConfigService.deleteNetworkConfig(tokenType, blockchain, network);
    return {
      success: true,
      message: 'Network configuration deleted successfully',
    };
  }
}
```

### Step 3.2: Create Admin Network Config Module

**File:** `apps/raverpay-api/src/admin/alchemy/network-config/admin-network-config.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AdminNetworkConfigController } from './admin-network-config.controller';
import { AlchemyNetworkConfigModule } from '../../../alchemy/config/alchemy-network-config.module';

@Module({
  imports: [AlchemyNetworkConfigModule],
  controllers: [AdminNetworkConfigController],
})
export class AdminNetworkConfigModule {}
```

### Step 3.3: Update Admin Alchemy Module

**File:** `apps/raverpay-api/src/admin/alchemy/admin-alchemy.module.ts`

Add the network config module:

```typescript
import { AdminNetworkConfigModule } from './network-config/admin-network-config.module';

@Module({
  imports: [
    AdminNetworkConfigModule, // ADD THIS
    // ... other imports
  ],
  // ... rest of module
})
export class AdminAlchemyModule {}
```

### Step 3.4: Create DTOs

**File:** `apps/raverpay-api/src/admin/alchemy/network-config/admin-network-config.dto.ts`

```typescript
import { IsString, IsBoolean, IsOptional, IsInt, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertNetworkConfigDto {
  @ApiProperty({ example: 'USDC' })
  @IsString()
  tokenType: string;

  @ApiProperty({ example: 'USD Coin' })
  @IsString()
  tokenName: string;

  @ApiProperty({ example: 'USDC' })
  @IsString()
  tokenSymbol: string;

  @ApiProperty({ example: 'POLYGON' })
  @IsString()
  blockchain: string;

  @ApiProperty({ example: 'Polygon' })
  @IsString()
  blockchainName: string;

  @ApiProperty({ example: 'mainnet' })
  @IsString()
  network: string;

  @ApiProperty({ example: 'Polygon Mainnet' })
  @IsString()
  networkLabel: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isTestnet: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  isEnabled: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({ example: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' })
  @IsString()
  @IsOptional()
  tokenAddress?: string;

  @ApiPropertyOptional({ example: 6 })
  @IsNumber()
  @IsOptional()
  decimals?: number;
}

export class QueryNetworkConfigDto {
  @ApiPropertyOptional({ example: 'USDC' })
  @IsString()
  @IsOptional()
  tokenType?: string;

  @ApiPropertyOptional({ example: 'POLYGON' })
  @IsString()
  @IsOptional()
  blockchain?: string;

  @ApiPropertyOptional({ example: 'mainnet' })
  @IsString()
  @IsOptional()
  network?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isTestnet?: boolean;
}

export class ToggleNetworkDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isEnabled: boolean;
}
```

---

## Phase 4: Admin Dashboard UI

### Step 4.1: Create Network Config API Client

**File:** `apps/raverpay-admin/lib/api/alchemy-network-config.ts`

```typescript
import apiClient from '../api-client';

export interface AlchemyNetworkConfig {
  id: string;
  tokenType: string;
  tokenName: string;
  tokenSymbol: string;
  blockchain: string;
  blockchainName: string;
  network: string;
  networkLabel: string;
  isTestnet: boolean;
  isEnabled: boolean;
  displayOrder: number;
  tokenAddress: string | null;
  decimals: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface UpsertNetworkConfigDto {
  tokenType: string;
  tokenName: string;
  tokenSymbol: string;
  blockchain: string;
  blockchainName: string;
  network: string;
  networkLabel: string;
  isTestnet: boolean;
  isEnabled: boolean;
  displayOrder?: number;
  tokenAddress?: string;
  decimals?: number;
}

export interface ToggleNetworkDto {
  isEnabled: boolean;
}

export const alchemyNetworkConfigApi = {
  /**
   * Get all network configurations
   */
  getAllConfigs: async (params?: {
    tokenType?: string;
    blockchain?: string;
    network?: string;
    isEnabled?: boolean;
    isTestnet?: boolean;
  }): Promise<AlchemyNetworkConfig[]> => {
    const response = await apiClient.get('/admin/alchemy/network-config', { params });
    return response.data.data;
  },

  /**
   * Get enabled networks grouped by token
   */
  getGroupedConfigs: async () => {
    const response = await apiClient.get('/admin/alchemy/network-config/grouped');
    return response.data.data.tokens;
  },

  /**
   * Get specific network config
   */
  getConfig: async (
    tokenType: string,
    blockchain: string,
    network: string,
  ): Promise<AlchemyNetworkConfig> => {
    const response = await apiClient.get(
      `/admin/alchemy/network-config/${tokenType}/${blockchain}/${network}`,
    );
    return response.data.data;
  },

  /**
   * Create or update network config
   */
  upsertConfig: async (data: UpsertNetworkConfigDto): Promise<AlchemyNetworkConfig> => {
    const response = await apiClient.post('/admin/alchemy/network-config', data);
    return response.data.data;
  },

  /**
   * Enable/disable network
   */
  toggleNetwork: async (
    tokenType: string,
    blockchain: string,
    network: string,
    isEnabled: boolean,
  ): Promise<AlchemyNetworkConfig> => {
    const response = await apiClient.patch(
      `/admin/alchemy/network-config/${tokenType}/${blockchain}/${network}/toggle`,
      { isEnabled },
    );
    return response.data.data;
  },

  /**
   * Delete network config
   */
  deleteConfig: async (tokenType: string, blockchain: string, network: string): Promise<void> => {
    await apiClient.delete(`/admin/alchemy/network-config/${tokenType}/${blockchain}/${network}`);
  },
};
```

### Step 4.2: Create Network Config Page

**File:** `apps/raverpay-admin/app/dashboard/alchemy/network-config/page.tsx`

````typescript
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, AlertCircle, Coins } from 'lucide-react';
import { alchemyNetworkConfigApi, AlchemyNetworkConfig } from '@/lib/api/alchemy-network-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { truncateAddress } from '@/lib/utils';

export default function NetworkConfigPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query: Get all network configurations
  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['alchemy-network-configs'],
    queryFn: () => alchemyNetworkConfigApi.getAllConfigs(),
  });

  // Mutation: Toggle network enabled/disabled
  const toggleMutation = useMutation({
    mutationFn: ({
      tokenType,
      blockchain,
      network,
      isEnabled,
    }: {
      tokenType: string;
      blockchain: string;
      network: string;
      isEnabled: boolean;
    }) => alchemyNetworkConfigApi.toggleNetwork(tokenType, blockchain, network, isEnabled),
    onSuccess: (data, variables) => {
      toast({
        title: 'Success',
        description: `Network ${variables.isEnabled ? 'enabled' : 'disabled'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['alchemy-network-configs'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update network',
        variant: 'destructive',
      });
    },
  });

  // Mutation: Delete network config
  const deleteMutation = useMutation({
    mutationFn: ({
      tokenType,
      blockchain,
      network,
    }: {
      tokenType: string;
      blockchain: string;
      network: string;
    }) => alchemyNetworkConfigApi.deleteConfig(tokenType, blockchain, network),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Network configuration deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['alchemy-network-configs'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete network',
        variant: 'destructive',
      });
    },
  });

  // Group configs by token type
  const groupedConfigs = configs.reduce(
    (acc, config) => {
      if (!acc[config.tokenType]) {
        acc[config.tokenType] = [];
      }
      acc[config.tokenType].push(config);
      return acc;
    },
    {} as Record<string, AlchemyNetworkConfig[]>,
  );

  const handleToggle = (config: AlchemyNetworkConfig) => {
    toggleMutation.mutate({
      tokenType: config.tokenType,
      blockchain: config.blockchain,
      network: config.network,
      isEnabled: !config.isEnabled,
    });
  };

  const handleDelete = (config: AlchemyNetworkConfig) => {
    if (confirm(`Are you sure you want to delete ${config.networkLabel}?`)) {
      deleteMutation.mutate({
        tokenType: config.tokenType,
        blockchain: config.blockchain,
        network: config.network,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Network Configuration</h2>
          <p className="text-muted-foreground">Manage available stablecoin networks for users</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Network
        </Button>
      </div>

      {/* Warning Banner */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-900">Caution</h3>
              <p className="mt-1 text-sm text-yellow-700">
                Disabling a network will prevent users from creating new wallets on that network.
                Existing wallets will remain functional.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Cards by Token */}
      <div className="space-y-6">
        {Object.entries(groupedConfigs).map(([tokenType, tokenConfigs]) => (
          <Card key={tokenType}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Coins className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">{tokenConfigs[0].tokenName}</CardTitle>
                  <CardDescription>{tokenType}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tokenConfigs.map((config) => (
                  <div
                    key={config.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent"
                  >
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={config.isEnabled}
                        onCheckedChange={() => handleToggle(config)}
                        disabled={toggleMutation.isPending}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{config.networkLabel}</span>
                          {config.isTestnet && (
                            <Badge variant="outline" className="text-yellow-600">
                              Testnet
                            </Badge>
                          )}
                          {!config.isEnabled && <Badge variant="secondary">Disabled</Badge>}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {config.blockchain} • {config.network}
                          {config.tokenAddress && (
                            <span className="ml-2 font-mono text-xs">
                              {truncateAddress(config.tokenAddress)}
  rst, add the Settings import at the top:

```typescript
import { Settings } from 'lucide-react'; // ADD THIS
````

Then find the Alchemy section and add the Network Config link:

```typescript
{
  title: 'Alchemy',
  items: [
    {
      title: 'Wallets',
      href: '/dashboard/alchemy/wallets',
      icon: Wallet,
    },
    {
      title: 'Transactions',
      href: '/dashboard/alchemy/transactions',
      icon: ArrowLeftRight,
    },
    {
      title: 'Gas Spending',
      href: '/dashboard/alchemy/gas-spending',
      icon: Zap,
    },
    {
      title: 'Network Config', // NEW
      href: '/dashboard/alchemy/network-config', // NEW
      icon: Settings, // NEW
      </div>
    </div>
  );
}
```

### Step 4.3: Add Navigation Link

**File:** `apps/raverpay-admin/components/dashboard/sidebar.tsx`

Find the Alchemy section and add the Network Config link:

```typescript
{
  title: 'Alchemy',
  items: [
    {
      title: 'Wallets',
      href: '/dashboard/alchemy/wallets',
      icon: Wallet,
    },
    {
      title: 'Transactions',
      href: '/dashboard/alchemy/transactions',
      icon: ArrowLeftRight,
    },
    {
      title: 'Gas Spending',
      href: '/dashboard/alchemy/gas-spending',
      icon: Zap,
    },
    {
      title: 'Network Config', // NEW
      href: '/dashboard/alchemy/network-config', // NEW
      icon: Settings, // NEW - import Settings from lucide-react
    },
  ],
},
```

---

## Phase 5: Mobile App Balance Display

### Step 5.1: Create Stablecoin Balance Hook

**File:** `apps/raverpay-mobile/src/hooks/useStablecoinBalance.ts`

````typescript
import { useState, useEffect } from 'react';
import { alchemyTransactionService } from '@/src/services/alchemy-transaction.service';
import { useToast } from './use-toast';

interface StablecoinBalance {
  tokenType: string;
  blockchain: string;
  network: string;
  balance: string;
  balanceUSD: number;
  tokenSymbol: string;
  decimals: number;
}

interface UseStablecoinBalanceReturn {
  balances: StablecoinBalance[];
  totalUSD: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStablecoinBalance(): UseStablecoinBalanceReturn {
  const [balances, setBalances] = useState<StablecoinBalance[]>([]);
  const [totalUSD, setTotalUSD] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchBalances = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all stablecoin wallets for the user
      const walletsResponse = await alchemyTransactionService.getStablecoinWallets();

      if (!walletsResponse.success || !walletsResponse.data) {
        setBalances([]);
        setTotalUSD(0);
        return;
      }

      const wallets = walletsResponse.data;

      // Fetch balance for each wallet
      const balancePromises = wallets.map(async (wallet) => {
        try {
          const balanceResponse = await alchemyTransactionService.getTokenBalance({
            tokenType: wallet.tokenType,
            blockchain: wallet.blockchain,
            network: wallet.network,
          });

          if (balanceResponse.success && balanceResponse.data) {
            return {
              tokenType: wallet.tokenType,
              blockchain: wallet.blockchain,
              network: wallet.network,
              balance: balanceResponse.data.balance,
              balanceUSD: parTypes

**File:** `apps/raverpay-mobile/src/types/stablecoin.types.ts`

Add the StablecoinWallet interface if it doesn't exist:

```typescript
export interface StablecoinWallet {
  id: string;
  userId: string;
  alchemyWalletId: string;
  tokenType: string;
  blockchain: string;
  network: string;
  monthlyIncome: string;
  bankStatementUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  alchemyWallet?: {
    address: string;
    blockchain: string;
    network: string;
  };
}
````

### Step 5.3: Add Stablecoin seFloat(balanceResponse.data.balance), // USDC/USDT are 1:1 with USD

              tokenSymbol: wallet.tokenType,
              decimals: 6,
            };
          }
          return null;
        } catch (err) {
          console.error(`Error fetching balance for ${wallet.tokenType}:`, err);
          return null;
        }
      });

      const fetchedBalances = (await Promise.all(balancePromises)).filter(
        (b): b is StablecoinBalance => b !== null,
      );

      setBalances(fetchedBalances);
      setTotalUSD(fetchedBalances.reduce((sum, b) => sum + b.balanceUSD, 0));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balances';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }

};

useEffect(() => {
fetchBalances();
}, []);

return {
balances,
totalUSD,
isLoading,
error,
refetch: fetchBalances,
};
}

````

### Step 5.2: Add Stablecoin Balance Service Methods

**File:** `apps/raverpay-mobile/src/services/alchemy-transaction.service.ts`

Add these methods to the existing service:

```typescript
/**
 * Get all 4tablecoin wallets for the current user
 */
async getStablecoinWallets() {
  try {
    const response = await api.get<ApiResponse<StablecoinWallet[]>>(
      endpoints.alchemy.GET_STABLECOIN_WALLETS,
    );
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
}

/**
 * Get toke5 balance for a specific stablecoin wallet
 */
async getTokenBalance(params: {
  tokenType: string;
  blockchain: string;
  network: string;
}) {
  try {
    const response = await api.post<ApiResponse<{ balance: string; balanceFormatted: string }>>(
      endpoints.alchemy.GET_TOKEN_BALANCE,
      params,
    );
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
}
````

### Step 5.3: Add API Endpoints

**File:** `apps/raverpay-mobile/src/lib/api/endpoints.ts`

Add to the alchemy section:

```typescript
alchemy: {
  // ... existing endpoints
  GET_STABLECOIN_WALLETS: '/alchemy/wallets/stablecoin/list',
  GET_TOKEN_BALANCE: '/alchemy/transactions/balance',
},
```

### Step 5.4: Update Home Screen with Stablecoin Balance

**File:** `apps/raverpay-mobile/app/(tabs)/home.tsx`

Add stablecoin balance card after the main balance card:

```typescript
import { useStablecoinBalance } from '@/src/hooks/useStablecoinBalance';

export default function HomeScreen() {
  // ... existing code
  const { totalUSD, isLoading: isLoadingStablecoin, refetch: refetchStablecoin } = useStablecoinBalance();

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* ... existing header and balance card */}

      {/* Stablecoin Balance Card */}
      <View className="px-4 mt-4">
        <Card className="p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Stablecoin Balance (USDC/USDT)
            </Text>
            <TouchableOpacity
              onPress={refetchStablecoin}
              disabled={isLoadingStablecoin}
            >
              <Ionicons
                name="refresh"
                size={18}
                color={isDark ? '#9ca3af' : '#6b7280'}
           6  />
            </TouchableOpacity>
          </View>

          {isLoadingStablecoin ? (
            <ActivityIndicator size="small" />
          ) : (
            <View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalUSD.toFixed(2)}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/stablecoin/select-token')}
                className="mt-3"
              >
                <View className="flex-row items-center justify-center bg-blue-50 dark:bg-blue-900/30 rounded-lg py-2">
                  <Ionicons name="add-circle-outline" size={16} color="#3b82f6" />
                  <Text className="ml-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                    Add Stablecoin Wallet
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </Card>
      </View>

      {/* ... rest of the screen */}
    </View>
  );
}
```

### Step 5.5: Update Receive Screen with Current Balance

**File:** `apps/raverpay-mobile/app/stablecoin/receive.tsx`

Add balance display above QR code:

````typescript
import { useState, useEffect } from 'react';
import { alchemyTransactionService } from '@/src/services/alchemy-transaction.service';

export default function ReceiveStablecoinScreen() {
  const { token, blockchain, network, address } = useLocalSearchParams();
  const [balance, setBalance] = useState<string>('0.00');
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const response = await alchemyTransactionService.getTokenBalance({
        tokenType: token as string,
        blockchain: blockchain as string,
        network: network as string,
      });

      if (response.success && response.data) {
        setBalance(response.data.balanceFormatted);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScreenHeader title="Receive" showBack />

      <ScrollView className="flex-1 px-4">
        {/* Current Balance Card */}
        <Card className="p-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Current Balance
              </Text>
              {isLoadingBalance ? (
                <ActivityIndicator size="small" className="mt-2" />
              ) : (
                <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {balance} {token}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={fetchBalance} disabled={isLoadingBalance}>
              <Ionicons
                name="refresh"
                size={24}
                color={isDark ? '#9ca3af' : '#6b7280'}
              />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Network Info */}
        <View className="mb-6">
          <Text className="text-center text-gray-600 dark:text-gray-400 mb-2">
            {token} on {blockchain}
          <7: Invalidate Balance After Wallet Creation

**File:** `apps/raverpay-mobile/app/stablecoin/creating.tsx`

After successful wallet creation, invalidate the balance query:

```typescript
import { useQueryClient } from '@tanstack/react-query';

export default function CreatingScreen() {
  const queryClient = useQueryClient();

  const createWallet = async () => {
    try {
      // ... existing wallet creation code

      const response = await stablecoinService.createStablecoinWallet(walletData);

      if (response.success) {
        // Invalidate balance query to refresh on home screen
        queryClient.invalidateQueries({ queryKey: ['stablecoin-balances'] });

        // Navigate to success screen
        router.replace({
          pathname: '/stablecoin/success',
          params: { /* ... */ },
        });
      }
    } catch (error) {
      // ... error handling
    }
  };

  // ... rest of component
}
```10

### Step 5.8: Update Balance Hook Query Key

**File:** `apps/raverpay-mobile/src/hooks/useStablecoinBalance.ts`

Make sure to use a consistent query key:

```typescript
// At the top of the hook, if using React Query:
export function useStablecoinBalance(): UseStablecoinBalanceReturn {
  const queryClient = useQueryClient();

  // If you want to use React Query for this as well:
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stablecoin-balances'], // Consistent key
    queryFn: async () => {
      // Fetch logic here
    },
    staleTime: 30000, // 30 seconds
  });

  // ... rest of hook
}
````

### Step 5.9Text>

          <View className="flex-row items-center justify-center">
            <View className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
              <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {network}
              </Text>
            </View>
          </View>
        </View>

        {/* QR Code Card */}
        <Card className="p-6 items-center mb-6">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Scan QR Code
          </Text>

          <View className="bg-white p-4 rounded-xl">
            <QRCode value={address as string} size={200} />
          </View>

          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
            Scan this code to receive {token}
          </Text>
        </Card>

        {/* Address Card with Copy/Share */}
        {/* ... existing code */}
      </ScrollView>
    </View>

);
}

````

### Step 5.6: Add Backend Endpoint for Stablecoin Wallets List

**File:** `apps/raverpay-api/src/alchemy/controllers/alchemy-stablecoin-wallet.controller.ts`

Add this endpoint:

```typescript
@Get('stablecoin/list')
@UseGuards(JwtAuthGuard)
@ApiOperation({
  summary: 'Get all stablecoin wallets for current user',
  description: 'Returns all stablecoin wallets created by the authenticated user',
})
@ApiResponse({ status: 200, description: 'Wallets retrieved successfully' })
async getStablecoinWallets(@Request() req: { user: { id: string } }) {
  try {
    const wallets = await this.stablecoinWalletService.getWalletsByUserId(req.user.id);

    return {
      success: true,
      data: wallets,
    };
  } catch (error) {
    this.logger.error(`Error getting stablecoin wallets: ${error.message}`, error.stack);
    throw error;
  }
}
````

### Step 5.7: Add Service Method

**File:** `apps/raverpay-api/src/alchemy/wallets/stablecoin-wallet.service.ts`

Add this method if it doesn't exist:

```typescript
/**
 * Get all stablecoin wallets for a user
 */
async getWalletsByUserId(userId: string) {
  return this.prisma.stablecoinWallet.findMany({
    where: { userId },
    include: {
      alchemyWallet: {
        select: {
          address: true,
          blockchain: true,
          network: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
```

---

## Phase 6: Testing & Rollout

### Step 6.1: Testing Checklist

✅ **Database Tests:**

- Migration runs successfully
- Seed data creates all networks
- Unique constraints work
- Indexes improve query performance

✅ **Backend Tests:**

- Network config service methods
- Admin API endpoints (CRUD operations)
- Network validation in wallet creation
- Mobile API returns enabled networks only
- Stablecoin wallets list endpoint
- Token balance endpoint

✅ **Admin Dashboard Tests:**

- Admin can view all networks
- Toggle enable/disable works
- Delete network works
- Loading states display correctly

✅ **Mobile App Tests:**

- Mobile app fetches networks dynamically
- Wallet creation blocked for disabled networks
- Home screen displays total stablecoin balance
- Receive screen shows current balance with refresh
- Balance updates after transactions
- useStablecoinBalance hook fetches all wallets

### Step 6.2: Rollout Strategy

**Week 1: Backend Implementation**

- Day 1-2: Database migration + seed
- Day 3-4: Service layer + API endpoints (network config + balance endpoints)
- Day 5: Testing & bug fixes

**Week 2: Admin Dashboard + Mobile Balance Display**

- Day 1-2: Admin UI implementation
- Day 3-4: Mobile balance hook + home screen updates
- Day 5: Receive screen balance display

**Week 3: Integration & Testing**

- End-to-end testing (network toggle → mobile app updates)
- Balance fetching and refresh functionality
- Load testing
- Security audit

**Week 4: Deployment**

- Deploy to staging
- User acceptance testing
- Deploy to production

---

## Summary

✅ **Database-driven network configuration**  
✅ **Admin can enable/disable networks without code changes**  
✅ **Mobile app fetches enabled networks dynamically**  
✅ **Validation prevents wallet creation on disabled networks**  
✅ **Scalable for adding new blockchains (Optimism, Avalanche, etc.)**  
✅ **Audit trail (createdBy, updatedBy)**  
✅ **Mobile app displays stablecoin balances on home screen**  
✅ **Receive screen shows current balance with refresh capability**  
✅ **Balance fetching uses existing AlchemyTransactionService infrastructure**

## Benefits

1. **Flexibility:** Add/remove networks without deployments
2. **Control:** Admin can quickly disable problematic networks
3. **Scalability:** Easy to add new blockchains
4. **Audit:** Track who made changes and when
5. **Safety:** Validation prevents users from creating wallets on disabled networks
6. **User Experience:** Mobile app always shows current available options
7. **Transparency:** Users can see their stablecoin balances in real-time
8. **Convenience:** Balance display on home screen and receive screens
9. **Reusability:** Leverages existing Alchemy infrastructure for balance fetching

## Technical Debt Addressed

- Eliminates hardcoded network lists
- Centralizes network configuration
- Provides admin visibility and control
- Enables A/B testing of new networks
- Supports gradual rollout strategies

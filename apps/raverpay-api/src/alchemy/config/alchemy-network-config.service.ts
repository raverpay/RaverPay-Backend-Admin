import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AlchemyNetworkConfig, Prisma } from '@prisma/client';

export interface QueryNetworkConfigParams {
  tokenType?: string;
  blockchain?: string;
  network?: string;
  isEnabled?: boolean;
  isTestnet?: boolean;
}

export interface GroupedNetworkConfig {
  tokenType: string;
  tokenSymbol: string;
  blockchains: {
    blockchain: string;
    blockchainName: string;
    networks: Array<{
      network: string;
      networkLabel: string;
      isTestnet: boolean;
      isEnabled: boolean;
      tokenAddress: string;
      decimals: number;
    }>;
  }[];
}

export interface UpsertNetworkConfigData {
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
  tokenAddress: string;
  decimals: number;
  metadata?: Prisma.InputJsonValue;
}

@Injectable()
export class AlchemyNetworkConfigService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get network configurations based on query filters
   */
  async getNetworkConfigs(
    query: QueryNetworkConfigParams = {},
  ): Promise<AlchemyNetworkConfig[]> {
    const where: Prisma.AlchemyNetworkConfigWhereInput = {};

    if (query.tokenType) {
      where.tokenType = query.tokenType;
    }
    if (query.blockchain) {
      where.blockchain = query.blockchain;
    }
    if (query.network) {
      where.network = query.network;
    }
    if (query.isEnabled !== undefined) {
      where.isEnabled = query.isEnabled;
    }
    if (query.isTestnet !== undefined) {
      where.isTestnet = query.isTestnet;
    }

    return this.prisma.alchemyNetworkConfig.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
    });
  }

  /**
   * Get enabled networks grouped by token type and blockchain
   */
  async getEnabledNetworksGrouped(): Promise<GroupedNetworkConfig[]> {
    const configs = await this.prisma.alchemyNetworkConfig.findMany({
      where: { isEnabled: true },
      orderBy: [
        { tokenType: 'asc' },
        { blockchain: 'asc' },
        { displayOrder: 'asc' },
      ],
    });

    const grouped = configs.reduce<Record<string, GroupedNetworkConfig>>(
      (acc, config) => {
        const key = config.tokenType;

        if (!acc[key]) {
          acc[key] = {
            tokenType: config.tokenType,
            tokenSymbol: config.tokenSymbol,
            blockchains: [],
          };
        }

        let blockchainGroup = acc[key].blockchains.find(
          (b) => b.blockchain === config.blockchain,
        );

        if (!blockchainGroup) {
          blockchainGroup = {
            blockchain: config.blockchain,
            blockchainName: config.blockchainName,
            networks: [],
          };
          acc[key].blockchains.push(blockchainGroup);
        }

        blockchainGroup.networks.push({
          network: config.network,
          networkLabel: config.networkLabel,
          isTestnet: config.isTestnet,
          isEnabled: config.isEnabled,
          tokenAddress: config.tokenAddress || '',
          decimals: config.decimals,
        });

        return acc;
      },
      {},
    );

    return Object.values(grouped);
  }

  /**
   * Get a specific network configuration
   */
  async getNetworkConfig(
    tokenType: string,
    blockchain: string,
    network: string,
  ): Promise<AlchemyNetworkConfig | null> {
    return this.prisma.alchemyNetworkConfig.findUnique({
      where: {
        tokenType_blockchain_network: {
          tokenType,
          blockchain,
          network,
        },
      },
    });
  }

  /**
   * Check if a specific network is enabled
   */
  async isNetworkEnabled(
    tokenType: string,
    blockchain: string,
    network: string,
  ): Promise<boolean> {
    const config = await this.getNetworkConfig(tokenType, blockchain, network);
    return config?.isEnabled ?? false;
  }

  /**
   * Create or update a network configuration (admin only)
   */
  async upsertNetworkConfig(
    data: UpsertNetworkConfigData,
    adminUserId: string,
  ): Promise<AlchemyNetworkConfig> {
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
   * Toggle network enabled/disabled status (admin only)
   */
  async toggleNetwork(
    tokenType: string,
    blockchain: string,
    network: string,
    isEnabled: boolean,
    adminUserId: string,
  ): Promise<AlchemyNetworkConfig> {
    const config = await this.getNetworkConfig(tokenType, blockchain, network);

    if (!config) {
      throw new NotFoundException(
        `Network configuration not found: ${tokenType}/${blockchain}/${network}`,
      );
    }

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
   * Delete a network configuration (admin only)
   */
  async deleteNetworkConfig(
    tokenType: string,
    blockchain: string,
    network: string,
  ): Promise<void> {
    const config = await this.getNetworkConfig(tokenType, blockchain, network);

    if (!config) {
      throw new NotFoundException(
        `Network configuration not found: ${tokenType}/${blockchain}/${network}`,
      );
    }

    await this.prisma.alchemyNetworkConfig.delete({
      where: {
        tokenType_blockchain_network: {
          tokenType,
          blockchain,
          network,
        },
      },
    });
  }

  /**
   * Get all token types available
   */
  async getTokenTypes(): Promise<string[]> {
    const configs = await this.prisma.alchemyNetworkConfig.findMany({
      select: { tokenType: true },
      distinct: ['tokenType'],
      orderBy: { tokenType: 'asc' },
    });

    return configs.map((c) => c.tokenType);
  }

  /**
   * Get all blockchains available for a token type
   */
  async getBlockchainsForToken(tokenType: string): Promise<string[]> {
    const configs = await this.prisma.alchemyNetworkConfig.findMany({
      where: { tokenType },
      select: { blockchain: true },
      distinct: ['blockchain'],
      orderBy: { blockchain: 'asc' },
    });

    return configs.map((c) => c.blockchain);
  }
}

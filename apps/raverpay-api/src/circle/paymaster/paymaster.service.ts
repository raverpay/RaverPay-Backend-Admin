import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CircleConfigService } from '../config/circle.config.service';
import { CircleApiClient } from '../circle-api.client';
import { CircleBlockchain, CircleFeeLevel } from '../circle.types';
import { PermitService } from './permit.service';
import { BundlerService } from './bundler.service';

/**
 * Paymaster Configuration per blockchain (v0.8)
 */
interface PaymasterConfig {
  blockchain: CircleBlockchain;
  paymasterAddress: string;
  supportedTokens: string[];
  surchargePercent: number;
  entryPointAddress: string;
}

/**
 * Sponsored transaction request
 */
export interface SponsoredTransactionRequest {
  walletId: string;
  destinationAddress: string;
  amount: string;
  blockchain: CircleBlockchain;
  feeLevel?: CircleFeeLevel;
  memo?: string;
}

/**
 * Sponsored transaction response
 */
export interface SponsoredTransactionResponse {
  userOpHash: string;
  transactionHash?: string;
  state: string;
  estimatedGasUsdc: string;
  actualGasUsdc?: string;
}

/**
 * Fee estimate for sponsored transaction
 */
export interface PaymasterFeeEstimate {
  estimatedGasInNative: string;
  estimatedGasInUsdc: string;
  surchargePercent: number;
  surchargeAmount: string;
  totalFeeInUsdc: string;
  feeLevel: CircleFeeLevel;
  blockchain: CircleBlockchain;
}

/**
 * Paymaster Service (v0.8)
 *
 * Handles gas fee sponsorship using Circle's Paymaster v0.8 functionality.
 * Allows users to pay gas fees in USDC instead of native tokens.
 *
 * Key features:
 * - EIP-7702 smart account support
 * - EIP-2612 permit signing for USDC allowance
 * - Bundler integration for UserOperation submission
 * - Event tracking for actual gas costs
 * - Multi-network support (mainnet + testnets)
 *
 * @see https://developers.circle.com/w3s/docs/paymaster
 */
@Injectable()
export class PaymasterService {
  private readonly logger = new Logger(PaymasterService.name);

  /**
   * Paymaster v0.8 configurations per blockchain
   * Addresses from: https://developers.circle.com/w3s/docs/paymaster-addresses-and-events
   */
  private readonly paymasterConfigs: Record<string, PaymasterConfig> = {
    // Mainnet
    ARB: {
      blockchain: 'ARB',
      paymasterAddress: '0x0578cFB241215b77442a541325d6A4E6dFE700Ec',
      supportedTokens: ['USDC'],
      surchargePercent: 10,
      entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    },
    AVAX: {
      blockchain: 'AVAX',
      paymasterAddress: '0x0578cFB241215b77442a541325d6A4E6dFE700Ec',
      supportedTokens: ['USDC'],
      surchargePercent: 0,
      entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    },
    BASE: {
      blockchain: 'BASE',
      paymasterAddress: '0x0578cFB241215b77442a541325d6A4E6dFE700Ec',
      supportedTokens: ['USDC'],
      surchargePercent: 10,
      entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    },
    ETH: {
      blockchain: 'ETH',
      paymasterAddress: '0x0578cFB241215b77442a541325d6A4E6dFE700Ec',
      supportedTokens: ['USDC'],
      surchargePercent: 0,
      entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    },
    OP: {
      blockchain: 'OP',
      paymasterAddress: '0x0578cFB241215b77442a541325d6A4E6dFE700Ec',
      supportedTokens: ['USDC'],
      surchargePercent: 0,
      entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    },
    MATIC: {
      blockchain: 'MATIC',
      paymasterAddress: '0x0578cFB241215b77442a541325d6A4E6dFE700Ec',
      supportedTokens: ['USDC'],
      surchargePercent: 0,
      entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    },
    // Testnet
    'ARB-SEPOLIA': {
      blockchain: 'ARB-SEPOLIA',
      paymasterAddress: '0x3BA9A96eE3eFf3A69E2B18886AcF52027EFF8966',
      supportedTokens: ['USDC'],
      surchargePercent: 10,
      entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    },
    'AVAX-FUJI': {
      blockchain: 'AVAX-FUJI',
      paymasterAddress: '0x3BA9A96eE3eFf3A69E2B18886AcF52027EFF8966',
      supportedTokens: ['USDC'],
      surchargePercent: 0,
      entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    },
    'BASE-SEPOLIA': {
      blockchain: 'BASE-SEPOLIA',
      paymasterAddress: '0x3BA9A96eE3eFf3A69E2B18886AcF52027EFF8966',
      supportedTokens: ['USDC'],
      surchargePercent: 10,
      entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    },
    'ETH-SEPOLIA': {
      blockchain: 'ETH-SEPOLIA',
      paymasterAddress: '0x3BA9A96eE3eFf3A69E2B18886AcF52027EFF8966',
      supportedTokens: ['USDC'],
      surchargePercent: 0,
      entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    },
    'OP-SEPOLIA': {
      blockchain: 'OP-SEPOLIA',
      paymasterAddress: '0x3BA9A96eE3eFf3A69E2B18886AcF52027EFF8966',
      supportedTokens: ['USDC'],
      surchargePercent: 0,
      entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    },
    'MATIC-AMOY': {
      blockchain: 'MATIC-AMOY',
      paymasterAddress: '0x3BA9A96eE3eFf3A69E2B18886AcF52027EFF8966',
      supportedTokens: ['USDC'],
      surchargePercent: 0,
      entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    },
  };

  constructor(
    private readonly config: CircleConfigService,
    private readonly apiClient: CircleApiClient,
    private readonly prisma: PrismaService,
    private readonly permitService: PermitService,
    private readonly bundlerService: BundlerService,
  ) {}

  /**
   * Check if Paymaster is supported for a given blockchain
   */
  isPaymasterSupported(blockchain: CircleBlockchain): boolean {
    return blockchain in this.paymasterConfigs;
  }

  /**
   * Get supported blockchains for Paymaster
   */
  getSupportedBlockchains(): CircleBlockchain[] {
    return Object.keys(this.paymasterConfigs) as CircleBlockchain[];
  }

  /**
   * Get Paymaster configuration for a blockchain
   */
  getPaymasterConfig(blockchain: CircleBlockchain): PaymasterConfig | null {
    return this.paymasterConfigs[blockchain] || null;
  }

  /**
   * Check if a wallet supports Paymaster (requires SCA wallet type)
   */
  async isWalletPaymasterCompatible(walletId: string): Promise<boolean> {
    try {
      const wallet = await this.prisma.circleWallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet) {
        return false;
      }

      return wallet.accountType === 'SCA';
    } catch (error) {
      this.logger.error(
        `Failed to check wallet Paymaster compatibility: ${error}`,
      );
      return false;
    }
  }

  /**
   * Get Paymaster usage stats for a wallet
   */
  async getPaymasterUsageStats(walletId: string): Promise<{
    totalTransactions: number;
    totalGasPaidUsdc: string;
    averageGasPerTx: string;
  }> {
    try {
      const userOps = await this.prisma.paymasterUserOperation.findMany({
        where: { walletId },
        include: { events: true },
      });

      const totalTransactions = userOps.length;
      let totalGasPaid = 0;

      for (const userOp of userOps) {
        if (userOp.actualGasUsdc) {
          totalGasPaid += parseFloat(userOp.actualGasUsdc);
        }
      }

      const averageGas =
        totalTransactions > 0 ? totalGasPaid / totalTransactions : 0;

      return {
        totalTransactions,
        totalGasPaidUsdc: totalGasPaid.toFixed(6),
        averageGasPerTx: averageGas.toFixed(6),
      };
    } catch (error) {
      this.logger.error(`Failed to get Paymaster usage stats: ${error}`);
      return {
        totalTransactions: 0,
        totalGasPaidUsdc: '0',
        averageGasPerTx: '0',
      };
    }
  }

  /**
   * Get UserOperation by hash
   */
  async getUserOperation(userOpHash: string) {
    return this.prisma.paymasterUserOperation.findUnique({
      where: { userOpHash },
      include: {
        wallet: true,
        events: true,
      },
    });
  }

  /**
   * Get UserOperations for a wallet
   */
  async getWalletUserOperations(walletId: string) {
    return this.prisma.paymasterUserOperation.findMany({
      where: { walletId },
      include: { events: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Estimate gas fee in USDC for a transaction
   * This is a placeholder - full implementation requires bundler integration
   */
  async estimateFeeInUsdc(
    walletId: string,
    destinationAddress: string,
    amount: string,
    blockchain: CircleBlockchain,
    feeLevel: CircleFeeLevel = 'MEDIUM',
  ): Promise<PaymasterFeeEstimate> {
    if (!this.isPaymasterSupported(blockchain)) {
      throw new Error(`Paymaster not supported for blockchain: ${blockchain}`);
    }

    const config = this.paymasterConfigs[blockchain];

    // TODO: Implement actual gas estimation using bundler
    // For now, return placeholder estimates
    const estimatedGasInNative = '0.001'; // 0.001 ETH equivalent
    const estimatedGasInUsdc = '3.00'; // $3 USDC
    const surchargeAmount = (
      (parseFloat(estimatedGasInUsdc) * config.surchargePercent) /
      100
    ).toFixed(6);
    const totalFeeInUsdc = (
      parseFloat(estimatedGasInUsdc) + parseFloat(surchargeAmount)
    ).toFixed(6);

    return {
      estimatedGasInNative,
      estimatedGasInUsdc,
      surchargePercent: config.surchargePercent,
      surchargeAmount,
      totalFeeInUsdc,
      feeLevel,
      blockchain,
    };
  }

  /**
   * Create a sponsored transaction (gas paid in USDC)
   * This is a placeholder - full implementation requires:
   * 1. Permit signature from client
   * 2. UserOperation construction
   * 3. Bundler submission
   */
  async createSponsoredTransaction(
    request: SponsoredTransactionRequest,
  ): Promise<SponsoredTransactionResponse> {
    const { walletId, destinationAddress, amount, blockchain, feeLevel = 'MEDIUM' } = request;

    if (!this.isPaymasterSupported(blockchain)) {
      throw new Error(`Paymaster not supported for blockchain: ${blockchain}`);
    }

    // TODO: Full implementation requires:
    // 1. Get permit signature from client
    // 2. Construct UserOperation with paymaster data
    // 3. Submit to bundler
    // 4. Track in database
    // 5. Listen for UserOperationSponsored event

    // Placeholder response
    const userOpHash = `0x${Date.now().toString(16)}`;
    const estimate = await this.estimateFeeInUsdc(
      walletId,
      destinationAddress,
      amount,
      blockchain,
      feeLevel,
    );

    return {
      userOpHash,
      state: 'PENDING',
      estimatedGasUsdc: estimate.totalFeeInUsdc,
    };
  }
}

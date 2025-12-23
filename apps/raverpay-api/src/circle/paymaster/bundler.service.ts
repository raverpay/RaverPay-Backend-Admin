import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createPublicClient,
  createWalletClient,
  http,
  type PublicClient,
  type Chain,
  type Transport,
  hexToBigInt,
} from 'viem';
import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  mainnet,
  sepolia,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
} from 'viem/chains';
import { CircleBlockchain } from '../circle.types';

/**
 * Bundler Service
 * Handles ERC-4337 bundler integration for UserOperation submission
 */
@Injectable()
export class BundlerService {
  private readonly logger = new Logger(BundlerService.name);
  private readonly bundlerClients: Map<string, any> = new Map();
  private readonly publicClients: Map<string, PublicClient> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.initializeClients();
  }

  /**
   * Initialize bundler and public clients for all supported chains
   */
  private initializeClients() {
    const chains = this.getSupportedChains();

    for (const [blockchain, chain] of Object.entries(chains)) {
      try {
        // Create public client for reading blockchain state
        const publicClient = createPublicClient({
          chain,
          transport: http(),
        });

        this.publicClients.set(blockchain, publicClient);

        // Get bundler RPC URL from environment
        const bundlerUrl = this.getBundlerUrl(blockchain);
        if (bundlerUrl) {
          this.logger.log(
            `Initialized bundler client for ${blockchain}: ${bundlerUrl}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Failed to initialize client for ${blockchain}:`,
          error,
        );
      }
    }
  }

  /**
   * Get bundler RPC URL for a blockchain
   */
  private getBundlerUrl(blockchain: string): string | null {
    const envKey = `BUNDLER_RPC_URL_${blockchain.replace(/-/g, '_').toUpperCase()}`;
    const url = this.configService.get<string>(envKey);

    if (!url) {
      this.logger.warn(`No bundler URL configured for ${blockchain} (${envKey})`);
    }

    return url || null;
  }

  /**
   * Get supported chains mapping
   */
  private getSupportedChains(): Record<string, Chain> {
    return {
      ETH: mainnet,
      'ETH-SEPOLIA': sepolia,
      ARB: arbitrum,
      'ARB-SEPOLIA': arbitrumSepolia,
      AVAX: avalanche,
      'AVAX-FUJI': avalancheFuji,
      BASE: base,
      'BASE-SEPOLIA': baseSepolia,
      OP: optimism,
      'OP-SEPOLIA': optimismSepolia,
      MATIC: polygon,
      'MATIC-AMOY': polygonAmoy,
    };
  }

  /**
   * Get public client for a blockchain
   */
  getPublicClient(blockchain: CircleBlockchain): PublicClient | null {
    return this.publicClients.get(blockchain) || null;
  }

  /**
   * Get chain for a blockchain
   */
  getChain(blockchain: CircleBlockchain): Chain | null {
    const chains = this.getSupportedChains();
    return chains[blockchain] || null;
  }

  /**
   * Estimate gas prices from bundler
   */
  async estimateUserOperationGas(params: {
    blockchain: CircleBlockchain;
    userOp: any;
  }): Promise<{
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
    preVerificationGas: bigint;
    verificationGasLimit: bigint;
    callGasLimit: bigint;
  }> {
    const { blockchain, userOp } = params;

    const bundlerUrl = this.getBundlerUrl(blockchain);
    if (!bundlerUrl) {
      throw new Error(`No bundler configured for ${blockchain}`);
    }

    try {
      // Get gas prices from bundler (Pimlico format)
      const gasPriceResponse = await fetch(bundlerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'pimlico_getUserOperationGasPrice',
          params: [],
        }),
      });

      const gasPriceData = await gasPriceResponse.json();

      if (gasPriceData.error) {
        throw new Error(
          `Bundler gas price error: ${gasPriceData.error.message}`,
        );
      }

      const { standard } = gasPriceData.result;

      // Estimate gas limits
      const gasEstimateResponse = await fetch(bundlerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'eth_estimateUserOperationGas',
          params: [userOp, await this.getEntryPointAddress(blockchain)],
        }),
      });

      const gasEstimateData = await gasEstimateResponse.json();

      if (gasEstimateData.error) {
        throw new Error(
          `Bundler gas estimate error: ${gasEstimateData.error.message}`,
        );
      }

      const { preVerificationGas, verificationGasLimit, callGasLimit } =
        gasEstimateData.result;

      return {
        maxFeePerGas: hexToBigInt(standard.maxFeePerGas),
        maxPriorityFeePerGas: hexToBigInt(standard.maxPriorityFeePerGas),
        preVerificationGas: hexToBigInt(preVerificationGas),
        verificationGasLimit: hexToBigInt(verificationGasLimit),
        callGasLimit: hexToBigInt(callGasLimit),
      };
    } catch (error) {
      this.logger.error(
        `Failed to estimate gas for ${blockchain}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Submit UserOperation to bundler
   */
  async submitUserOperation(params: {
    blockchain: CircleBlockchain;
    userOp: any;
  }): Promise<string> {
    const { blockchain, userOp } = params;

    const bundlerUrl = this.getBundlerUrl(blockchain);
    if (!bundlerUrl) {
      throw new Error(`No bundler configured for ${blockchain}`);
    }

    try {
      const response = await fetch(bundlerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_sendUserOperation',
          params: [userOp, await this.getEntryPointAddress(blockchain)],
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(`Bundler submission error: ${data.error.message}`);
      }

      const userOpHash = data.result;
      this.logger.log(
        `UserOperation submitted to ${blockchain}: ${userOpHash}`,
      );

      return userOpHash;
    } catch (error) {
      this.logger.error(
        `Failed to submit UserOperation to ${blockchain}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Wait for UserOperation receipt
   */
  async waitForUserOperationReceipt(params: {
    blockchain: CircleBlockchain;
    userOpHash: string;
    timeout?: number;
  }): Promise<{
    userOpHash: string;
    transactionHash: string;
    blockNumber: number;
    success: boolean;
  }> {
    const { blockchain, userOpHash, timeout = 60000 } = params;

    const bundlerUrl = this.getBundlerUrl(blockchain);
    if (!bundlerUrl) {
      throw new Error(`No bundler configured for ${blockchain}`);
    }

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(bundlerUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getUserOperationReceipt',
            params: [userOpHash],
          }),
        });

        const data = await response.json();

        if (data.result) {
          const receipt = data.result;
          return {
            userOpHash,
            transactionHash: receipt.receipt.transactionHash,
            blockNumber: parseInt(receipt.receipt.blockNumber, 16),
            success: receipt.success,
          };
        }

        // Wait 2 seconds before polling again
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        this.logger.warn(
          `Error polling for UserOperation receipt: ${error.message}`,
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    throw new Error(
      `Timeout waiting for UserOperation receipt: ${userOpHash}`,
    );
  }

  /**
   * Get EntryPoint address for a blockchain
   * Using EntryPoint v0.7: 0x0000000071727De22E5E9d8BAf0edAc6f37da032
   */
  private async getEntryPointAddress(
    blockchain: CircleBlockchain,
  ): Promise<string> {
    // EntryPoint v0.7 address (same across all chains)
    return '0x0000000071727De22E5E9d8BAf0edAc6f37da032';
  }

  /**
   * Check if bundler is available for a blockchain
   */
  isBundlerAvailable(blockchain: CircleBlockchain): boolean {
    return this.getBundlerUrl(blockchain) !== null;
  }
}

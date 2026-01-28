import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AlchemyTransactionState } from '@prisma/client';
import * as crypto from 'crypto';
import { AuditService } from '../../common/services/audit.service';
import {
  AuditAction,
  AuditResource,
  AuditSeverity,
  ActorType,
  AuditStatus,
} from '../../common/types/audit-log.types';
import { StablecoinDepositService } from '../deposits/stablecoin-deposit.service';
import { AlchemyConfigService } from '../config/alchemy-config.service';

/**
 * Alchemy Webhook Service
 *
 * Handles incoming webhooks from Alchemy
 * - Verifies webhook signatures
 * - Processes address activity events
 * - Updates transaction states
 * - Monitors gas spending
 */
@Injectable()
export class AlchemyWebhookService {
  private readonly logger = new Logger(AlchemyWebhookService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly stablecoinDepositService: StablecoinDepositService,
    private readonly alchemyConfigService: AlchemyConfigService,
  ) {
    this.logger.log('Alchemy webhook service initialized');
  }

  /**
   * Verify webhook signature from Alchemy
   *
   * Alchemy signs webhooks with HMAC-SHA256
   * Signature is sent in x-alchemy-signature header
   *
   * @param signature - Signature from x-alchemy-signature header
   * @param body - Raw request body (as string)
   * @returns True if signature is valid
   */
  verifySignature(signature: string, body: string): boolean {
    const signingKey = this.configService.get<string>(
      'ALCHEMY_WEBHOOK_SIGNING_SECRET',
    );

    if (!signingKey) {
      this.logger.warn(
        'ALCHEMY_WEBHOOK_SIGNING_SECRET not configured - skipping signature verification',
      );
      return true; // Allow in development if not configured
    }

    try {
      // Alchemy uses HMAC-SHA256
      const hmac = crypto.createHmac('sha256', signingKey);
      hmac.update(body);
      const expectedSignature = hmac.digest('hex');

      const sigBuffer = Buffer.from(signature);
      const expectedBuffer = Buffer.from(expectedSignature);

      if (sigBuffer.length !== expectedBuffer.length) {
        this.logger.error('Signature length mismatch');
        return false;
      }

      // Compare signatures (constant-time comparison)
      const isValid = crypto.timingSafeEqual(sigBuffer, expectedBuffer);

      if (!isValid) {
        this.logger.error('Invalid webhook signature detected!');
      }

      return isValid;
    } catch (error) {
      this.logger.error('Error verifying webhook signature', error.stack);
      return false;
    }
  }

  /**
   * Process address activity webhook
   *
   * Updates transaction states based on blockchain events
   *
   * @param payload - Webhook payload from Alchemy
   */
  async processAddressActivity(payload: any) {
    this.logger.log(`Processing address activity webhook: ${payload.id}`);

    const { event } = payload;

    if (!event || !event.activity) {
      this.logger.warn('Invalid webhook payload - no activity found');
      return;
    }

    // Process each activity in the event
    for (const activity of event.activity) {
      try {
        await this.processActivity(activity, event.network);
      } catch (error) {
        this.logger.error(
          `Error processing activity: ${error.message}`,
          error.stack,
        );
      }
    }
  }

  /**
   * Process individual blockchain activity
   * @private
   */
  private async processActivity(
    activity: {
      hash: string;
      blockNum?: string;
      fromAddress: string;
      toAddress: string;
      category: string;
      value?: string;
      asset?: string;
    },
    network: string,
  ) {
    const { hash, blockNum, fromAddress, toAddress, category, value, asset } =
      activity;

    this.logger.debug(`Processing activity: ${hash} on ${network}`);

    // Check if this is an ERC-20 token transfer (stablecoin deposit)
    if (category === 'erc20' && asset && value && toAddress) {
      await this.processStablecoinDeposit(
        hash,
        toAddress,
        asset,
        value,
        network,
        blockNum,
      );
    }

    // Find transaction by hash (for existing transactions)
    const transaction = await this.prisma.alchemyTransaction.findUnique({
      where: { transactionHash: hash },
    });

    if (!transaction) {
      this.logger.debug(
        `Transaction ${hash} not found in database - might be external transaction or deposit`,
      );
      // Don't return early - might be a deposit we need to process
      // Continue to check if it's a deposit
      return;
    }

    // Determine new state based on activity
    let newState = transaction.state;
    const confirmations = transaction.confirmations + 1;

    // Update state based on confirmations
    if (
      confirmations >= 1 &&
      transaction.state === AlchemyTransactionState.SUBMITTED
    ) {
      newState = AlchemyTransactionState.CONFIRMED;
    }

    if (
      confirmations >= 3 &&
      transaction.state === AlchemyTransactionState.CONFIRMED
    ) {
      newState = AlchemyTransactionState.COMPLETED;
    }

    // Update transaction
    await this.prisma.alchemyTransaction.update({
      where: { id: transaction.id },
      data: {
        blockNumber: blockNum ? BigInt(blockNum) : transaction.blockNumber,
        confirmations,
        state: newState,
        completedAt:
          newState === AlchemyTransactionState.COMPLETED
            ? new Date()
            : transaction.completedAt,
      },
    });

    this.logger.log(
      `Updated transaction ${transaction.reference}: ${transaction.state} → ${newState} (${confirmations} confirmations)`,
    );

    // Track gas spending if this is a completed transaction
    if (newState === AlchemyTransactionState.COMPLETED && transaction.gasUsed) {
      await this.trackGasSpending(transaction);
    }
  }

  /**
   * Track gas spending for analytics
   * @private
   */
  private async trackGasSpending(transaction: any) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find or create gas spending record for today
      const existing = await this.prisma.alchemyGasSpending.findUnique({
        where: {
          userId_walletAddress_date: {
            userId: transaction.userId,
            walletAddress: transaction.sourceAddress,
            date: today,
          },
        },
      });

      if (existing) {
        // Update existing record
        await this.prisma.alchemyGasSpending.update({
          where: { id: existing.id },
          data: {
            totalGasUsed: (
              BigInt(existing.totalGasUsed) + BigInt(transaction.gasUsed || '0')
            ).toString(),
            transactionCount: existing.transactionCount + 1,
          },
        });
      } else {
        // Create new record
        await this.prisma.alchemyGasSpending.create({
          data: {
            userId: transaction.userId,
            walletAddress: transaction.sourceAddress,
            blockchain: transaction.blockchain,
            network: transaction.network,
            gasPolicyId: transaction.walletId, // Simplified - would link to gas policy
            date: today,
            totalGasUsed: transaction.gasUsed || '0',
            totalGasUsd: '0', // Would calculate based on gas price
            transactionCount: 1,
          },
        });
      }

      this.logger.debug(`Tracked gas spending for user ${transaction.userId}`);
    } catch (error) {
      this.logger.error('Error tracking gas spending', error.stack);
    }
  }

  /**
   * Process stablecoin deposit from ERC-20 transfer
   * @private
   */
  private async processStablecoinDeposit(
    transactionHash: string,
    toAddress: string,
    tokenContractAddress: string,
    amount: string,
    network: string,
    blockNumber?: string,
  ) {
    try {
      this.logger.log(
        `Processing stablecoin deposit: ${transactionHash} to ${toAddress}`,
      );

      // Normalize addresses to lowercase for comparison
      const normalizedToAddress = toAddress.toLowerCase();
      const normalizedTokenAddress = tokenContractAddress.toLowerCase();

      // Find matching StablecoinWallet by address
      const stablecoinWallet = await this.prisma.stablecoinWallet.findFirst({
        where: {
          address: normalizedToAddress,
          status: 'ACTIVE',
        },
        include: {
          alchemyWallet: true,
        },
      });

      if (!stablecoinWallet) {
        this.logger.debug(
          `No stablecoin wallet found for address ${normalizedToAddress}`,
        );
        return;
      }

      // Determine token type by matching contract address
      // Get network config to check token addresses
      let tokenType: 'USDC' | 'USDT' | null = null;
      let blockchain: string | null = null;

      try {
        // Try to get network config from stablecoin wallet
        const networkConfig = this.alchemyConfigService.getNetworkConfig(
          stablecoinWallet.blockchain,
          stablecoinWallet.network,
        );

        // Check if token address matches USDC or USDT
        if (
          networkConfig.usdcAddress?.toLowerCase() === normalizedTokenAddress
        ) {
          tokenType = 'USDC';
          blockchain = stablecoinWallet.blockchain;
        } else if (
          networkConfig.usdtAddress?.toLowerCase() === normalizedTokenAddress
        ) {
          tokenType = 'USDT';
          blockchain = stablecoinWallet.blockchain;
        } else {
          this.logger.debug(
            `Token contract ${normalizedTokenAddress} does not match USDC/USDT for ${stablecoinWallet.blockchain}-${stablecoinWallet.network}`,
          );
          return;
        }
      } catch (error) {
        this.logger.error(
          `Failed to determine token type: ${error.message}`,
          error.stack,
        );
        return;
      }

      // Verify token type matches stablecoin wallet token type
      if (stablecoinWallet.tokenType !== tokenType) {
        this.logger.debug(
          `Token type mismatch: wallet expects ${stablecoinWallet.tokenType}, received ${tokenType}`,
        );
        return;
      }

      // Create deposit record
      const deposit = await this.stablecoinDepositService.createDeposit({
        stablecoinWalletId: stablecoinWallet.id,
        transactionHash,
        tokenType,
        amount,
        blockchain: blockchain || stablecoinWallet.blockchain,
        network: stablecoinWallet.network,
        blockNumber: blockNumber?.toString(),
      });

      // Audit log: Deposit received
      await this.auditService.log({
        userId: stablecoinWallet.userId,
        action: AuditAction.STABLECOIN_DEPOSIT_RECEIVED,
        resource: AuditResource.STABLECOIN_DEPOSIT,
        resourceId: deposit.id,
        metadata: {
          transactionHash,
          tokenType,
          amount,
          blockchain: stablecoinWallet.blockchain,
          network: stablecoinWallet.network,
          stablecoinWalletId: stablecoinWallet.id,
        },
        actorType: ActorType.SYSTEM,
        severity: AuditSeverity.MEDIUM,
        status: AuditStatus.SUCCESS,
      });

      this.logger.log(
        `Created stablecoin deposit record ${deposit.id} for wallet ${stablecoinWallet.id}`,
      );

      // Update deposit status to CONFIRMED after a short delay or based on block confirmations
      // For now, we'll mark as PENDING and let a separate process confirm it
      // In production, you might want to wait for multiple confirmations
    } catch (error) {
      this.logger.error(
        `Error processing stablecoin deposit: ${error.message}`,
        error.stack,
      );
      // Don't throw - log error but continue processing other activities
    }
  }

  /**
   * Get webhook statistics for monitoring
   */
  async getWebhookStats() {
    // In a real implementation, you'd track webhook receipts
    // For now, return basic transaction stats
    const total = await this.prisma.alchemyTransaction.count();
    const pending = await this.prisma.alchemyTransaction.count({
      where: { state: AlchemyTransactionState.PENDING },
    });
    const completed = await this.prisma.alchemyTransaction.count({
      where: { state: AlchemyTransactionState.COMPLETED },
    });
    const failed = await this.prisma.alchemyTransaction.count({
      where: { state: AlchemyTransactionState.FAILED },
    });

    return {
      totalTransactions: total,
      pending,
      completed,
      failed,
      successRate: total > 0 ? ((completed / total) * 100).toFixed(2) : '0',
    };
  }
}

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Stablecoin Deposit Service
 *
 * Manages stablecoin deposit records
 * - Create deposit records from webhooks
 * - Confirm deposits
 * - Query deposits
 */
@Injectable()
export class StablecoinDepositService {
  private readonly logger = new Logger(StablecoinDepositService.name);

  constructor(private readonly prisma: PrismaService) {
    this.logger.log('Stablecoin deposit service initialized');
  }

  /**
   * Create deposit record from webhook
   */
  async createDeposit(params: {
    stablecoinWalletId: string;
    transactionHash: string;
    tokenType: string;
    amount: string;
    blockchain: string;
    network: string;
    blockNumber?: string;
  }) {
    const {
      stablecoinWalletId,
      transactionHash,
      tokenType,
      amount,
      blockchain,
      network,
      blockNumber,
    } = params;

    this.logger.log(
      `Creating deposit record: ${transactionHash} for wallet ${stablecoinWalletId}`,
    );

    // Check if deposit already exists
    const existing = await this.prisma.stablecoinDeposit.findUnique({
      where: { transactionHash },
    });

    if (existing) {
      this.logger.log(
        `Deposit ${transactionHash} already exists, skipping creation`,
      );
      return existing;
    }

    const deposit = await this.prisma.stablecoinDeposit.create({
      data: {
        stablecoinWalletId,
        transactionHash,
        tokenType,
        amount,
        blockchain,
        network,
        blockNumber,
        status: 'PENDING',
      },
    });

    this.logger.log(`Created deposit record ${deposit.id}`);

    return deposit;
  }

  /**
   * Confirm deposit (update status to CONFIRMED)
   */
  async confirmDeposit(depositId: string, blockNumber?: string) {
    const deposit = await this.prisma.stablecoinDeposit.findUnique({
      where: { id: depositId },
    });

    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }

    const updated = await this.prisma.stablecoinDeposit.update({
      where: { id: depositId },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        blockNumber: blockNumber || deposit.blockNumber,
      },
    });

    this.logger.log(`Confirmed deposit ${depositId}`);

    return updated;
  }

  /**
   * Get deposits by wallet ID
   */
  async getDepositsByWallet(
    stablecoinWalletId: string,
    limit = 50,
    offset = 0,
  ) {
    const deposits = await this.prisma.stablecoinDeposit.findMany({
      where: { stablecoinWalletId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return deposits;
  }

  /**
   * Get deposit by transaction hash
   */
  async getDepositByTxHash(transactionHash: string) {
    const deposit = await this.prisma.stablecoinDeposit.findUnique({
      where: { transactionHash },
      include: {
        stablecoinWallet: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }

    return deposit;
  }

  /**
   * Get deposit by ID
   */
  async getDepositById(depositId: string) {
    const deposit = await this.prisma.stablecoinDeposit.findUnique({
      where: { id: depositId },
      include: {
        stablecoinWallet: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }

    return deposit;
  }
}

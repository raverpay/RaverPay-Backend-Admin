import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  QueryStablecoinDepositsDto,
  CreditNairaDto,
} from './admin-stablecoin-deposits.dto';
import { Prisma } from '@prisma/client';

/**
 * Admin Stablecoin Deposits Service
 *
 * Manages admin operations for stablecoin deposits
 * - List deposits with filters
 * - Get deposit details
 * - Credit Naira wallet (V2)
 */
@Injectable()
export class AdminStablecoinDepositsService {
  private readonly logger = new Logger(AdminStablecoinDepositsService.name);

  constructor(private readonly prisma: PrismaService) {
    this.logger.log('Admin stablecoin deposits service initialized');
  }

  /**
   * Get paginated stablecoin deposits with filters
   */
  async getStablecoinDeposits(query: QueryStablecoinDepositsDto) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      tokenType,
      blockchain,
      network,
      userId,
      startDate,
      endDate,
    } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.StablecoinDepositWhereInput = {};

    if (search) {
      where.OR = [
        { transactionHash: { contains: search, mode: 'insensitive' } },
        {
          stablecoinWallet: {
            address: { contains: search, mode: 'insensitive' },
          },
        },
        {
          stablecoinWallet: {
            user: {
              OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    if (status) where.status = status;
    if (tokenType) where.tokenType = tokenType;
    if (blockchain) where.blockchain = blockchain;
    if (network) where.network = network;
    if (userId) {
      where.stablecoinWallet = {
        userId,
      };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [deposits, total] = await Promise.all([
      this.prisma.stablecoinDeposit.findMany({
        where,
        skip,
        take: limit,
        include: {
          stablecoinWallet: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stablecoinDeposit.count({ where }),
    ]);

    return {
      data: deposits.map((deposit) => ({
        id: deposit.id,
        transactionHash: deposit.transactionHash,
        tokenType: deposit.tokenType,
        amount: deposit.amount,
        amountUSD: deposit.amountUSD,
        blockchain: deposit.blockchain,
        network: deposit.network,
        blockNumber: deposit.blockNumber,
        status: deposit.status,
        confirmedAt: deposit.confirmedAt,
        convertedAt: deposit.convertedAt,
        nairaCredited: deposit.nairaCredited,
        nairaAmount: deposit.nairaAmount,
        createdAt: deposit.createdAt,
        updatedAt: deposit.updatedAt,
        user: deposit.stablecoinWallet.user,
        walletAddress: deposit.stablecoinWallet.address,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
                phone: true,
              },
            },
            alchemyWallet: {
              select: {
                id: true,
                address: true,
                blockchain: true,
                network: true,
              },
            },
          },
        },
      },
    });

    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }

    return {
      id: deposit.id,
      transactionHash: deposit.transactionHash,
      tokenType: deposit.tokenType,
      amount: deposit.amount,
      amountUSD: deposit.amountUSD,
      blockchain: deposit.blockchain,
      network: deposit.network,
      blockNumber: deposit.blockNumber,
      status: deposit.status,
      confirmedAt: deposit.confirmedAt,
      convertedAt: deposit.convertedAt,
      nairaCredited: deposit.nairaCredited,
      nairaAmount: deposit.nairaAmount,
      createdAt: deposit.createdAt,
      updatedAt: deposit.updatedAt,
      user: deposit.stablecoinWallet.user,
      walletAddress: deposit.stablecoinWallet.address,
      stablecoinWallet: deposit.stablecoinWallet,
    };
  }

  /**
   * Credit user's Naira wallet (V2)
   * This endpoint requires MFA verification (handled by ReAuthGuard)
   */
  async creditNairaWallet(
    depositId: string,
    dto: CreditNairaDto,
    adminUserId: string,
  ) {
    // Get deposit
    const deposit = await this.prisma.stablecoinDeposit.findUnique({
      where: { id: depositId },
      include: {
        stablecoinWallet: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }

    if (deposit.nairaCredited) {
      throw new Error('Naira has already been credited for this deposit');
    }

    if (deposit.status !== 'CONFIRMED') {
      throw new Error(
        `Deposit must be CONFIRMED before crediting Naira. Current status: ${deposit.status}`,
      );
    }

    // Calculate Naira amount (V2 - would use exchange rate + markup)
    // For now, this is a placeholder - actual conversion logic would be in V2
    const nairaAmount = deposit.amountUSD
      ? deposit.amountUSD.times(1500) // Placeholder rate
      : null;

    // Update deposit status
    const updated = await this.prisma.stablecoinDeposit.update({
      where: { id: depositId },
      data: {
        status: 'CONVERTED',
        convertedAt: new Date(),
        nairaCredited: true,
        nairaAmount,
      },
    });

    this.logger.log(
      `Deposit ${depositId} marked as converted by admin ${adminUserId}`,
    );

    // TODO: V2 - Actually credit user's Naira wallet using AdminWalletsService
    // For now, just update the deposit record

    return updated;
  }
}

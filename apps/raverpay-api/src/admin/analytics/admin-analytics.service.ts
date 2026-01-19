import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, TransactionStatus } from '@prisma/client';

@Injectable()
export class AdminAnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Helper method to generate time-series data
   */
  private generateTimeSeries<T extends { createdAt: Date }>(
    data: T[],
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month',
    getValue: (item: T) => {
      revenue?: number;
      count?: number;
      volume?: number;
      successCount?: number;
    },
  ): Array<{
    date: string;
    revenue?: number;
    count?: number;
    volume?: number;
    successCount?: number;
  }> {
    const periods: Map<
      string,
      {
        revenue?: number;
        count?: number;
        volume?: number;
        successCount?: number;
      }
    > = new Map();
    const periodDates: string[] = [];

    // Initialize all periods in range
    const current = new Date(startDate);
    while (current <= endDate) {
      let periodKey: string;

      if (groupBy === 'day') {
        periodKey = current.toISOString().split('T')[0];
        current.setDate(current.getDate() + 1);
      } else if (groupBy === 'week') {
        const weekStart = new Date(current);
        weekStart.setDate(current.getDate() - current.getDay());
        periodKey = weekStart.toISOString().split('T')[0];
        current.setDate(current.getDate() + 7);
      } else {
        // month
        periodKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        current.setMonth(current.getMonth() + 1);
      }

      if (!periods.has(periodKey)) {
        periods.set(periodKey, {
          revenue: 0,
          count: 0,
          volume: 0,
          successCount: 0,
        });
        periodDates.push(periodKey);
      }
    }

    // Aggregate data into periods
    for (const item of data) {
      const itemDate = new Date(item.createdAt);
      let periodKey: string;

      if (groupBy === 'day') {
        periodKey = itemDate.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(itemDate);
        weekStart.setDate(itemDate.getDate() - itemDate.getDay());
        periodKey = weekStart.toISOString().split('T')[0];
      } else {
        // month
        periodKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
      }

      if (periods.has(periodKey)) {
        const current = periods.get(periodKey)!;
        const value = getValue(item);
        periods.set(periodKey, {
          revenue: (current.revenue || 0) + (value.revenue || 0),
          count: (current.count || 0) + (value.count || 0),
          volume: (current.volume || 0) + (value.volume || 0),
          successCount: (current.successCount || 0) + (value.successCount || 0),
        });
      }
    }

    // Convert to array format
    return periodDates.map((date) => ({
      date,
      ...periods.get(date)!,
    }));
  }

  /**
   * Get dashboard overview analytics
   */
  async getDashboardAnalytics(startDate?: string, endDate?: string) {
    const dateFilter: Prisma.TransactionWhereInput['createdAt'] = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const [
      totalUsers,
      activeUsers,
      totalWalletBalance,
      transactionsToday,
      revenueToday,
      pendingKYC,
      failedTransactions,
      pendingDeletions,
    ] = await Promise.all([
      // Total users
      this.prisma.user.count(),

      // Active users (logged in within last 30 days)
      this.prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Total platform balance
      this.prisma.wallet.aggregate({
        _sum: { balance: true },
      }),

      // Transactions today
      this.prisma.transaction.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),

      // Revenue today (fees collected)
      this.prisma.transaction.aggregate({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
          status: TransactionStatus.COMPLETED,
        },
        _sum: { fee: true },
      }),

      // Pending KYC count
      this.prisma.user.count({
        where: {
          OR: [
            { bvnVerified: false, bvn: { not: null } },
            { ninVerified: false, nin: { not: null } },
          ],
        },
      }),

      // Failed transactions count
      this.prisma.transaction.count({
        where: { status: TransactionStatus.FAILED },
      }),

      // Pending deletion requests
      this.prisma.accountDeletionRequest.count({
        where: { status: 'PENDING' },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      wallets: {
        totalBalance: totalWalletBalance._sum.balance || 0,
      },
      transactions: {
        today: transactionsToday,
      },
      revenue: {
        today: revenueToday._sum.fee || 0,
      },
      pending: {
        kyc: pendingKYC,
        failedTransactions,
        deletionRequests: pendingDeletions,
      },
    };
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(
    startDate?: string,
    endDate?: string,
    groupBy: 'day' | 'week' | 'month' = 'day',
  ) {
    const where: Prisma.TransactionWhereInput = {
      status: TransactionStatus.COMPLETED,
    };

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = start;
      if (endDate) where.createdAt.lte = end;
    }

    const [totalRevenue, revenueByType, allTransactions] = await Promise.all([
      // Total revenue
      this.prisma.transaction.aggregate({
        where,
        _sum: { fee: true },
        _count: true,
      }),

      // Revenue by transaction type
      this.prisma.transaction.groupBy({
        by: ['type'],
        where,
        _sum: { fee: true },
        _count: true,
      }),

      // All transactions for time-series
      this.prisma.transaction.findMany({
        where,
        select: {
          createdAt: true,
          fee: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
    ]);

    // Generate time-series data
    const timeSeries = this.generateTimeSeries(
      allTransactions,
      start,
      end,
      groupBy,
      (tx) => ({ revenue: Number(tx.fee), count: 1 }),
    );

    return {
      totalRevenue: totalRevenue._sum.fee || 0,
      totalTransactions: totalRevenue._count,
      byType: revenueByType.map((item) => ({
        type: item.type,
        revenue: item._sum.fee || 0,
        count: item._count,
      })),
      timeSeries: timeSeries.map((item) => ({
        date: item.date,
        revenue: String(item.revenue),
        count: item.count,
      })),
    };
  }

  /**
   * Get user growth analytics
   */
  async getUserGrowthAnalytics(startDate?: string, endDate?: string) {
    const where: Prisma.UserWhereInput = {};

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = start;
      if (endDate) where.createdAt.lte = end;
    }

    const [newUsers, usersByKYCTier, usersByStatus, allUsers] =
      await Promise.all([
        // New users count
        this.prisma.user.count({ where }),

        // Users by KYC tier
        this.prisma.user.groupBy({
          by: ['kycTier'],
          where,
          _count: true,
        }),

        // Users by status
        this.prisma.user.groupBy({
          by: ['status'],
          where,
          _count: true,
        }),

        // All users for time-series
        this.prisma.user.findMany({
          where,
          select: {
            createdAt: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        }),
      ]);

    // Generate time-series data (grouped by day)
    const timeSeries = this.generateTimeSeries(
      allUsers,
      start,
      end,
      'day',
      () => ({ count: 1 }),
    );

    return {
      newUsers,
      byKYCTier: usersByKYCTier.map((item) => ({
        tier: item.kycTier,
        count: item._count,
      })),
      byStatus: usersByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      timeSeries: timeSeries.map((item) => ({
        date: item.date,
        count: item.count || 0,
      })),
    };
  }

  /**
   * Get transaction trends
   */
  async getTransactionTrends(
    startDate?: string,
    endDate?: string,
    type?: string,
  ) {
    const where: Prisma.TransactionWhereInput = {};

    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = start;
      if (endDate) where.createdAt.lte = end;
    }

    if (type) {
      where.type = type as any;
    }

    const [totalVolume, totalCount, byStatus, allTransactions] =
      await Promise.all([
        // Total volume
        this.prisma.transaction.aggregate({
          where,
          _sum: { amount: true },
        }),

        // Total count
        this.prisma.transaction.count({ where }),

        // By status
        this.prisma.transaction.groupBy({
          by: ['status'],
          where,
          _count: true,
        }),

        // All transactions for time-series
        this.prisma.transaction.findMany({
          where,
          select: {
            createdAt: true,
            amount: true,
            status: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        }),
      ]);

    const successCount =
      byStatus.find((s) => s.status === TransactionStatus.COMPLETED)?._count ||
      0;
    const successRate =
      totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(2) : '0';

    // Generate time-series data
    const timeSeries = this.generateTimeSeries(
      allTransactions,
      start,
      end,
      'day',
      (tx) => ({
        volume: Number(tx.amount),
        count: 1,
        successCount: tx.status === TransactionStatus.COMPLETED ? 1 : 0,
      }),
    );

    return {
      totalVolume: totalVolume._sum.amount || 0,
      totalCount,
      successRate,
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      timeSeries: timeSeries.map((item) => ({
        date: item.date,
        volume: String(item.volume || 0),
        count: item.count || 0,
        successCount: item.successCount || 0,
      })),
    };
  }
}

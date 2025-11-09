import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaystackService } from '../payments/paystack.service';

@Injectable()
export class VirtualAccountsService {
  private readonly logger = new Logger(VirtualAccountsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paystackService: PaystackService,
  ) {}

  /**
   * Create virtual account for a user
   */
  async createVirtualAccount(userId: string): Promise<void> {
    try {
      // Check if user already has a virtual account
      const existing = await this.prisma.virtualAccount.findFirst({
        where: { userId },
      });

      if (existing) {
        this.logger.log(`User ${userId} already has a virtual account`);
        return;
      }

      // Get user details
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        this.logger.error(`User ${userId} not found`);
        return;
      }

      // Create virtual account with Paystack
      const virtualAccount = await this.paystackService.createVirtualAccount(
        user.email,
        user.firstName,
        user.lastName,
        user.phone,
      );

      // Save to database
      await this.prisma.virtualAccount.create({
        data: {
          userId: user.id,
          accountNumber: virtualAccount.account_number,
          accountName: virtualAccount.account_name,
          bankName: virtualAccount.bank.name,
          bankCode: virtualAccount.bank.slug,
          provider: 'paystack',
          providerRef: virtualAccount.id.toString(),
          isActive: virtualAccount.active,
        },
      });

      this.logger.log(
        `Virtual account created for user ${userId}: ${virtualAccount.account_number}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create virtual account for user ${userId}`,
        error,
      );
      // Don't throw error - we don't want to fail user registration if this fails
      // Virtual account can be created later
    }
  }

  /**
   * Get virtual account for a user
   */
  async getVirtualAccount(userId: string) {
    return this.prisma.virtualAccount.findFirst({
      where: { userId, isActive: true },
    });
  }
}

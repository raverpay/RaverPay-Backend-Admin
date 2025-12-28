import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CircleApiClient } from '../circle-api.client';
import { CircleBlockchain } from '../circle.types';
import { initiateUserControlledWalletsClient } from '@circle-fin/user-controlled-wallets';

/**
 * User-Controlled Wallet Service
 * Manages Circle user-controlled (non-custodial) wallets
 * Now using Circle's official SDK for proper API handling
 */
@Injectable()
export class UserControlledWalletService implements OnModuleInit {
  private readonly logger = new Logger(UserControlledWalletService.name);
  private circleClient: ReturnType<typeof initiateUserControlledWalletsClient>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly circleApi: CircleApiClient, // Keep for backwards compatibility
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    // Initialize Circle's official SDK
    const apiKey = this.configService.get<string>('CIRCLE_API_KEY');
    if (!apiKey) {
      this.logger.warn('CIRCLE_API_KEY not found, Circle SDK will not work');
      return;
    }

    this.circleClient = initiateUserControlledWalletsClient({
      apiKey,
    });
    this.logger.log('Circle User-Controlled Wallets SDK initialized');
  }

  /**
   * Create a Circle user for user-controlled wallets
   * This is the first step in creating a user-controlled wallet
   */
  async createCircleUser(params: {
    userId: string;
    email?: string;
    authMethod: 'EMAIL' | 'PIN' | 'SOCIAL';
  }) {
    const { userId, email, authMethod } = params;

    this.logger.log(`Creating Circle user for userId: ${userId}`);

    // Generate a unique Circle user ID (UUID format)
    const circleUserId = `${userId}-${Date.now()}`;

    try {
      // Use Circle's official SDK
      const response = await this.circleClient.createUser({
        userId: circleUserId,
      });

      this.logger.log(`Circle SDK createUser response status: ${response.status}`);
      this.logger.debug(`Circle SDK createUser response: ${JSON.stringify(response.data)}`);

      if (response.status !== 201) {
        throw new Error(`Failed to create user: status ${response.status}`);
      }

      // Save to database
      const circleUser = await this.prisma.circleUser.create({
        data: {
          userId,
          circleUserId,
          authMethod,
          email,
          status: 'ENABLED',
        },
      });

      return {
        id: circleUser.id,
        circleUserId: circleUser.circleUserId,
        authMethod: circleUser.authMethod,
        status: circleUser.status,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create Circle user: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to create Circle user: ${error.message}`);
    }
  }

  /**
   * Get user token for Circle user
   * User tokens are valid for 60 minutes and required for all user operations
   */
  async getUserToken(circleUserId: string) {
    this.logger.log(`Getting user token for: ${circleUserId}`);

    try {
      // Use Circle's official SDK
      const response = await this.circleClient.createUserToken({
        userId: circleUserId,
      });

      this.logger.log(`Circle SDK createUserToken response status: ${response.status}`);
      this.logger.debug(`Circle SDK createUserToken response: ${JSON.stringify(response.data)}`);

      if (response.status !== 200 || !response.data) {
        throw new Error(`Failed to get user token: status ${response.status}`);
      }

      return {
        userToken: response.data.userToken,
        encryptionKey: response.data.encryptionKey,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get user token: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to get user token: ${error.message}`);
    }
  }

  /**
   * Initialize user and create wallet with PIN
   * For NEW users: Creates PIN + security questions + wallet
   * For EXISTING users: Just creates wallet (user already has PIN)
   */
  async initializeUserWithWallet(params: {
    userToken: string;
    blockchain: CircleBlockchain | CircleBlockchain[];
    accountType: 'SCA' | 'EOA';
    userId: string;
    circleUserId: string;
    isExistingUser?: boolean; // If true, uses createWallet instead of createUserPinWithWallets
  }) {
    const { userToken, blockchain, accountType, userId, circleUserId, isExistingUser } = params;

    // Normalize to array
    const blockchains = Array.isArray(blockchain) ? blockchain : [blockchain];

    this.logger.log(
      `${isExistingUser ? 'Adding wallet(s)' : 'Initializing user with wallet(s)'} on ${blockchains.join(', ')} (${accountType})`,
    );

    try {
      let response;

      // Note: Circle's createWallet requires the user to already have completed PIN setup
      // For users who have already set up PIN, we can use createWallet
      // But if that fails, we fall back to createUserPinWithWallets which will just prompt for PIN confirmation
      if (isExistingUser) {
        this.logger.log('Using createUserPinWithWallets for existing user (will prompt for PIN confirmation)');
        // Even for existing users, createUserPinWithWallets works - it just prompts for PIN instead of setup
        response = await this.circleClient.createUserPinWithWallets({
          userId: circleUserId,
          blockchains: blockchains as any,
          accountType,
        });
      } else {
        // New user - create PIN + security questions + wallet
        this.logger.log('Using createUserPinWithWallets for new user');
        response = await this.circleClient.createUserPinWithWallets({
          userId: circleUserId,
          blockchains: blockchains as any,
          accountType,
        });
      }

      this.logger.log(`Circle SDK response status: ${response.status}`);
      this.logger.debug(`Circle SDK response: ${JSON.stringify(response.data)}`);

      if (response.status !== 201 || !response.data?.challengeId) {
        throw new Error(`Failed to initialize user: status ${response.status}`);
      }

      return {
        challengeId: response.data.challengeId,
      };
    } catch (error) {
      // Log the full error response from Circle
      const errorData = error.response?.data || error.message;
      this.logger.error(
        `Failed to ${isExistingUser ? 'add wallet' : 'initialize user with wallet'}: ${JSON.stringify(errorData)}`,
        error.stack,
      );
      throw new Error(
        `Failed to ${isExistingUser ? 'add wallet' : 'initialize user with wallet'}: ${error.message}`,
      );
    }
  }

  /**
   * List user's wallets
   * Returns all wallets for a Circle user
   */
  async listUserWallets(userToken: string) {
    this.logger.log('Listing user wallets');

    try {
      const response = await this.circleClient.listWallets({
        userToken,
      });

      this.logger.debug(`Circle SDK listWallets response: ${JSON.stringify(response.data)}`);

      if (response.status !== 200) {
        throw new Error(`Failed to list wallets: status ${response.status}`);
      }

      return {
        wallets: response.data?.wallets || [],
      };
    } catch (error) {
      this.logger.error(
        `Failed to list wallets: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to list wallets: ${error.message}`);
    }
  }

  /**
   * Sync user-controlled wallets from Circle API to database
   * Call this after successful challenge completion
   */
  async syncUserWalletsToDatabase(params: {
    userToken: string;
    userId: string;
    circleUserId: string;
  }) {
    const { userToken, userId, circleUserId } = params;

    this.logger.log(`Syncing user-controlled wallets to database for user: ${userId}`);

    try {
      // Fetch wallets from Circle API
      const { wallets } = await this.listUserWallets(userToken);

      if (!wallets || wallets.length === 0) {
        this.logger.log(`No wallets found for user ${userId}`);
        return { synced: 0, wallets: [] };
      }

      this.logger.log(`Found ${wallets.length} wallets from Circle API`);

      // Get the CircleUser record to link wallets
      const circleUser = await this.prisma.circleUser.findFirst({
        where: { circleUserId },
      });

      if (!circleUser) {
        throw new Error(`CircleUser not found for circleUserId: ${circleUserId}`);
      }

      // Get or create a wallet set for user-controlled wallets
      const walletSetId = `user-controlled-${circleUserId}`;
      let walletSet = await this.prisma.circleWalletSet.findFirst({
        where: {
          circleWalletSetId: walletSetId,
        },
      });

      if (!walletSet) {
        walletSet = await this.prisma.circleWalletSet.create({
          data: {
            circleWalletSetId: walletSetId,
            name: 'User-Controlled Wallets',
            custodyType: 'USER',
          },
        });
        this.logger.log(`Created wallet set: ${walletSet.id}`);
      }

      // Sync each wallet to database
      const syncedWallets: any[] = [];
      for (const wallet of wallets) {
        // Check if wallet already exists by circleWalletId
        const existingWallet = await this.prisma.circleWallet.findFirst({
          where: { circleWalletId: wallet.id },
        });

        if (existingWallet) {
          this.logger.log(`Wallet ${wallet.id} already exists, skipping`);
          syncedWallets.push(existingWallet);
          continue;
        }

        // Use upsert to handle case where wallet exists on same userId+blockchain+custodyType
        const newWallet = await this.prisma.circleWallet.upsert({
          where: {
            userId_blockchain_custodyType: {
              userId,
              blockchain: wallet.blockchain,
              custodyType: 'USER',
            },
          },
          update: {
            // Update existing user-controlled wallet with new Circle wallet info
            circleWalletId: wallet.id,
            address: wallet.address,
            accountType: wallet.accountType as any,
            state: wallet.state as any,
            circleUserId: circleUser.id,
            scaCore: (wallet as any).scaCore || null,
          },
          create: {
            userId,
            circleWalletId: wallet.id,
            walletSetId: walletSet.id,
            address: wallet.address,
            blockchain: wallet.blockchain,
            accountType: wallet.accountType as any,
            state: wallet.state as any,
            name: `${wallet.blockchain} Wallet`,
            custodyType: 'USER',
            circleUserId: circleUser.id,
            scaCore: (wallet as any).scaCore || null,
          },
        });

        this.logger.log(`Synced wallet ${newWallet.id} for blockchain ${wallet.blockchain}`);
        syncedWallets.push(newWallet);
      }

      // Update CircleUser status to reflect successful setup
      await this.prisma.circleUser.update({
        where: { id: circleUser.id },
        data: {
          pinStatus: 'ENABLED',
          securityQuestionStatus: 'ENABLED',
        },
      });

      return {
        synced: syncedWallets.length,
        wallets: syncedWallets,
      };
    } catch (error) {
      this.logger.error(
        `Failed to sync wallets to database: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to sync wallets: ${error.message}`);
    }
  }

  /**
   * Get user status
   * Check whether a user has set up PIN and security questions
   */
  async getUserStatus(userToken: string) {
    this.logger.log(`Getting user status`);

    try {
      const response = await this.circleClient.getUserStatus({
        userToken,
      });

      this.logger.debug(`Circle SDK getUserStatus response: ${JSON.stringify(response.data)}`);

      if (response.status !== 200) {
        throw new Error(`Failed to get user status: status ${response.status}`);
      }

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to get user status: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to get user status: ${error.message}`);
    }
  }

  /**
   * Get Circle user by user ID
   */
  async getCircleUserByUserId(userId: string) {
    return this.prisma.circleUser.findFirst({
      where: { userId },
    });
  }

  /**
   * Get Circle user by Circle user ID
   */
  async getCircleUserByCircleUserId(circleUserId: string) {
    return this.prisma.circleUser.findFirst({
      where: { circleUserId },
    });
  }

  /**
   * Get user-controlled wallets for a user
   */
  async getUserControlledWallets(userId: string) {
    return this.prisma.circleWallet.findMany({
      where: {
        userId,
        custodyType: 'USER',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update Circle user status in database
   */
  async updateCircleUserStatus(
    circleUserId: string,
    data: {
      status?: string;
      pinStatus?: string;
      securityQuestionStatus?: string;
    },
  ) {
    return this.prisma.circleUser.update({
      where: { circleUserId },
      data: {
        status: data.status,
        pinStatus: data.pinStatus,
        securityQuestionStatus: data.securityQuestionStatus,
      },
    });
  }

  /**
   * Save security questions metadata
   */
  async saveSecurityQuestions(
    circleUserId: string,
    questions: Array<{
      questionId: string;
      questionText: string;
      questionIndex: number;
    }>,
  ) {
    const circleUser = await this.prisma.circleUser.findFirst({
      where: { circleUserId },
    });

    if (!circleUser) {
      throw new Error('Circle user not found');
    }

    // Delete existing questions and create new ones
    await this.prisma.circleSecurityQuestion.deleteMany({
      where: { circleUserId: circleUser.id },
    });

    await this.prisma.circleSecurityQuestion.createMany({
      data: questions.map((q) => ({
        circleUserId: circleUser.id,
        questionId: q.questionId,
        questionText: q.questionText,
        questionIndex: q.questionIndex,
      })),
    });

    return { success: true };
  }

  /**
   * Get security questions metadata
   */
  async getSecurityQuestions(circleUserId: string) {
    const circleUser = await this.prisma.circleUser.findFirst({
      where: { circleUserId },
    });

    if (!circleUser) {
      throw new Error('Circle user not found');
    }

    const questions = await this.prisma.circleSecurityQuestion.findMany({
      where: { circleUserId: circleUser.id },
      orderBy: { questionIndex: 'asc' },
    });

    return {
      questions: questions.map((q) => ({
        questionId: q.questionId,
        questionText: q.questionText,
        questionIndex: q.questionIndex,
      })),
    };
  }
}

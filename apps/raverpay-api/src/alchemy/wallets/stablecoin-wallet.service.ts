import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AlchemyWalletGenerationService } from './alchemy-wallet-generation.service';
import { AuditService } from '../../common/services/audit.service';
import {
  AuditAction,
  AuditResource,
  AuditSeverity,
  ActorType,
  AuditStatus,
} from '../../common/types/audit-log.types';
import {
  CreateStablecoinWalletDto,
  StablecoinWalletResponseDto,
  GetStablecoinWalletsQueryDto,
  StablecoinTokenType,
  StablecoinBlockchain,
  StablecoinNetwork,
} from './dto/stablecoin-wallet.dto';
import * as QRCode from 'qrcode';

/**
 * Stablecoin Wallet Service
 *
 * Manages stablecoin wallet configurations
 * - Creates stablecoin wallet records (links to AlchemyWallet)
 * - Returns same wallet address for all token/network combinations
 * - Generates QR codes for wallet addresses
 */
@Injectable()
export class StablecoinWalletService {
  private readonly logger = new Logger(StablecoinWalletService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: AlchemyWalletGenerationService,
    private readonly auditService: AuditService,
  ) {
    this.logger.log('Stablecoin wallet service initialized');
  }

  /**
   * Create or get stablecoin wallet
   *
   * Flow:
   * 1. Check if user has AlchemyWallet (create if not)
   * 2. Check if StablecoinWallet exists for token/network combo
   * 3. If exists → Return existing (same address)
   * 4. If not → Create StablecoinWallet record
   * 5. Generate QR code
   * 6. Audit log
   */
  async createStablecoinWallet(
    dto: CreateStablecoinWalletDto,
    userId: string,
  ): Promise<StablecoinWalletResponseDto> {
    this.logger.log(
      `Creating stablecoin wallet for user ${userId}: ${dto.tokenType} on ${dto.blockchain}-${dto.network}`,
    );

    // 1. Get or create AlchemyWallet (one per user)
    // generateEOAWallet now returns existing wallet if user already has one
    const alchemyWallet = await this.walletService.generateEOAWallet({
      userId,
      blockchain: dto.blockchain,
      network: dto.network,
      name: 'Stablecoin Wallet',
    });

    // 2. Check if StablecoinWallet already exists for this token/network combo
    const existingStablecoinWallet =
      await this.prisma.stablecoinWallet.findUnique({
        where: {
          userId_tokenType_blockchain_network: {
            userId,
            tokenType: dto.tokenType,
            blockchain: dto.blockchain,
            network: dto.network,
          },
        },
      });

    if (existingStablecoinWallet) {
      // Return existing wallet - same address
      this.logger.log(
        `Stablecoin wallet already exists for ${dto.tokenType} on ${dto.blockchain}-${dto.network}, returning existing`,
      );

      const qrCode = await this.generateQRCode(alchemyWallet.address);

      return {
        id: existingStablecoinWallet.id,
        address: alchemyWallet.address, // Same address
        tokenType: dto.tokenType,
        blockchain: dto.blockchain,
        network: dto.network,
        qrCode,
        createdAt: existingStablecoinWallet.createdAt,
      };
    }

    // 3. Create StablecoinWallet record (links to existing AlchemyWallet)
    const stablecoinWallet = await this.prisma.stablecoinWallet.create({
      data: {
        userId,
        alchemyWalletId: alchemyWallet.id,
        tokenType: dto.tokenType,
        blockchain: dto.blockchain,
        network: dto.network,
        address: alchemyWallet.address, // Same address as AlchemyWallet
        monthlyIncomeRange: dto.monthlyIncomeRange,
        bankStatementUrl: dto.bankStatementUrl,
        termsAccepted: dto.termsAccepted,
        termsAcceptedAt: new Date(),
        status: 'ACTIVE',
      },
    });

    // 4. Generate QR code
    const qrCode = await this.generateQRCode(alchemyWallet.address);

    // 5. Audit log: Stablecoin wallet created
    await this.auditService.log({
      userId,
      action: AuditAction.STABLECOIN_WALLET_CREATED,
      resource: AuditResource.STABLECOIN_WALLET,
      resourceId: stablecoinWallet.id,
      metadata: {
        tokenType: dto.tokenType,
        blockchain: dto.blockchain,
        network: dto.network,
        address: alchemyWallet.address,
        alchemyWalletId: alchemyWallet.id,
      },
      actorType: ActorType.USER,
      severity: AuditSeverity.MEDIUM,
      status: AuditStatus.SUCCESS,
    });

    this.logger.log(
      `Created stablecoin wallet ${stablecoinWallet.id} for user ${userId}`,
    );

    return {
      id: stablecoinWallet.id,
      address: alchemyWallet.address,
      tokenType: dto.tokenType,
      blockchain: dto.blockchain,
      network: dto.network,
      qrCode,
      createdAt: stablecoinWallet.createdAt,
    };
  }

  /**
   * Get all stablecoin wallets for a user
   */
  async getStablecoinWallets(
    userId: string,
    query?: GetStablecoinWalletsQueryDto,
  ): Promise<StablecoinWalletResponseDto[]> {
    const where: {
      userId: string;
      tokenType?: StablecoinTokenType;
      blockchain?: StablecoinBlockchain;
      network?: StablecoinNetwork;
    } = {
      userId,
    };

    if (query?.tokenType) {
      where.tokenType = query.tokenType;
    }
    if (query?.blockchain) {
      where.blockchain = query.blockchain;
    }
    if (query?.network) {
      where.network = query.network;
    }

    const wallets = await this.prisma.stablecoinWallet.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Generate QR codes for all wallets
    const walletsWithQrCodes = await Promise.all(
      wallets.map(async (wallet) => {
        const qrCode = await this.generateQRCode(wallet.address);
        return {
          id: wallet.id,
          address: wallet.address,
          tokenType: wallet.tokenType as StablecoinTokenType,
          blockchain: wallet.blockchain as StablecoinBlockchain,
          network: wallet.network as StablecoinNetwork,
          qrCode,
          createdAt: wallet.createdAt,
        };
      }),
    );

    return walletsWithQrCodes;
  }

  /**
   * Get stablecoin wallet by ID
   */
  async getStablecoinWalletById(
    walletId: string,
    userId: string,
  ): Promise<StablecoinWalletResponseDto> {
    const wallet = await this.prisma.stablecoinWallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Stablecoin wallet not found');
    }

    // Verify ownership
    if (wallet.userId !== userId) {
      throw new BadRequestException(
        'Access denied: You do not own this wallet',
      );
    }

    const qrCode = await this.generateQRCode(wallet.address);

    return {
      id: wallet.id,
      address: wallet.address,
      tokenType: wallet.tokenType as StablecoinTokenType,
      blockchain: wallet.blockchain as StablecoinBlockchain,
      network: wallet.network as StablecoinNetwork,
      qrCode,
      createdAt: wallet.createdAt,
    };
  }

  /**
   * Get stablecoin wallet by token/blockchain/network
   */
  async getStablecoinWalletByToken(
    userId: string,
    tokenType: StablecoinTokenType,
    blockchain: StablecoinBlockchain,
    network: StablecoinNetwork,
  ): Promise<StablecoinWalletResponseDto> {
    const wallet = await this.prisma.stablecoinWallet.findUnique({
      where: {
        userId_tokenType_blockchain_network: {
          userId,
          tokenType,
          blockchain,
          network,
        },
      },
    });

    if (!wallet) {
      throw new NotFoundException(
        `Stablecoin wallet not found for ${tokenType} on ${blockchain}-${network}`,
      );
    }

    const qrCode = await this.generateQRCode(wallet.address);

    return {
      id: wallet.id,
      address: wallet.address,
      tokenType: wallet.tokenType as StablecoinTokenType,
      blockchain: wallet.blockchain as StablecoinBlockchain,
      network: wallet.network as StablecoinNetwork,
      qrCode,
      createdAt: wallet.createdAt,
    };
  }

  /**
   * Generate QR code for wallet address
   * @private
   */
  private async generateQRCode(address: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(address, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        margin: 1,
        width: 300,
      });
      return qrCodeDataUrl;
    } catch (error) {
      this.logger.error(
        `Failed to generate QR code for address ${address}`,
        error,
      );
      // Return empty string if QR generation fails (non-critical)
      return '';
    }
  }
}

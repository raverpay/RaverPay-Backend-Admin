import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ReAuthGuard } from '../../../common/guards/re-auth.guard';
import { AdminStablecoinDepositsService } from './admin-stablecoin-deposits.service';
import {
  QueryStablecoinDepositsDto,
  CreditNairaDto,
} from './admin-stablecoin-deposits.dto';

/**
 * Admin Stablecoin Deposits Controller
 *
 * Manages admin endpoints for stablecoin deposits
 * All endpoints require admin authentication
 */
@ApiTags('Admin - Alchemy Stablecoin Deposits')
@ApiBearerAuth('JWT-auth')
@Controller('admin/alchemy/stablecoin-deposits')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminStablecoinDepositsController {
  private readonly logger = new Logger(AdminStablecoinDepositsController.name);

  constructor(
    private readonly adminStablecoinDepositsService: AdminStablecoinDepositsService,
  ) {}

  /**
   * Get paginated stablecoin deposits with filters
   */
  @Get()
  @ApiOperation({
    summary: 'Get paginated stablecoin deposits with filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Deposits retrieved successfully',
  })
  async getStablecoinDeposits(@Query() query: QueryStablecoinDepositsDto) {
    return this.adminStablecoinDepositsService.getStablecoinDeposits(query);
  }

  /**
   * Get deposit by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get stablecoin deposit by ID' })
  @ApiParam({ name: 'id', description: 'Deposit ID' })
  @ApiResponse({
    status: 200,
    description: 'Deposit retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Deposit not found' })
  async getDepositById(@Param('id') id: string) {
    const deposit =
      await this.adminStablecoinDepositsService.getDepositById(id);
    return {
      success: true,
      data: deposit,
    };
  }

  /**
   * Credit user's Naira wallet (V2)
   * Requires MFA verification
   */
  @Post(':id/credit-naira')
  @UseGuards(ReAuthGuard)
  @ApiOperation({
    summary: 'Credit user Naira wallet from stablecoin deposit (V2)',
    description:
      'Marks deposit as converted and credits user Naira wallet. Requires MFA verification.',
  })
  @ApiParam({ name: 'id', description: 'Deposit ID' })
  @ApiResponse({
    status: 200,
    description: 'Naira wallet credited successfully',
  })
  @ApiResponse({ status: 404, description: 'Deposit not found' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async creditNairaWallet(
    @Param('id') depositId: string,
    @Body() dto: CreditNairaDto,
    @Request() req: { user: { id: string } },
  ) {
    const adminUserId = req.user?.id;

    if (!adminUserId) {
      throw new Error('Admin user ID not found in request');
    }

    const deposit = await this.adminStablecoinDepositsService.creditNairaWallet(
      depositId,
      dto,
      adminUserId,
    );

    this.logger.log(
      `Admin ${adminUserId} credited Naira wallet for deposit ${depositId}`,
    );

    return {
      success: true,
      data: deposit,
      message: 'Naira wallet credited successfully',
    };
  }
}

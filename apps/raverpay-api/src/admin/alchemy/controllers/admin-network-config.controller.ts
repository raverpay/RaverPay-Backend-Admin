import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ReAuthGuard } from '../../../common/guards/re-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AlchemyNetworkConfigService } from '../../../alchemy/config/alchemy-network-config.service';
import {
  QueryNetworkConfigDto,
  UpsertNetworkConfigDto,
  NetworkConfigParamsDto,
  ToggleNetworkDto,
  DeleteNetworkDto,
} from '../dto/admin-network-config.dto';

/**
 * Admin Network Configuration Controller
 *
 * Manages stablecoin network configurations (admin only)
 * - View all network configurations
 * - Enable/disable networks without code deployments
 * - Add new networks or update existing ones
 */
@ApiTags('Admin - Network Configuration')
@Controller('admin/alchemy/network-config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminNetworkConfigController {
  private readonly logger = new Logger(AdminNetworkConfigController.name);

  constructor(
    private readonly networkConfigService: AlchemyNetworkConfigService,
  ) {}

  /**
   * Get all network configurations
   */
  @Get()
  @ApiOperation({
    summary: 'Get all network configurations',
    description:
      'Returns all network configurations (enabled and disabled) with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Network configurations retrieved successfully',
  })
  async getAllConfigs(@Query() query: QueryNetworkConfigDto) {
    try {
      const configs = await this.networkConfigService.getNetworkConfigs(query);

      return {
        success: true,
        data: configs,
        count: configs.length,
      };
    } catch (error) {
      this.logger.error(
        `Error getting network configs: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Get enabled networks grouped by token type and blockchain
   */
  @Get('grouped')
  @ApiOperation({
    summary: 'Get enabled networks grouped',
    description:
      'Returns enabled networks grouped by token type and blockchain for easier display',
  })
  @ApiResponse({
    status: 200,
    description: 'Grouped configurations retrieved successfully',
  })
  async getGroupedConfigs() {
    try {
      const grouped =
        await this.networkConfigService.getEnabledNetworksGrouped();

      return {
        success: true,
        data: grouped,
      };
    } catch (error) {
      this.logger.error(
        `Error getting grouped configs: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Get a specific network configuration
   */
  @Get(':tokenType/:blockchain/:network')
  @ApiOperation({
    summary: 'Get specific network configuration',
    description: 'Returns a single network configuration by its composite key',
  })
  @ApiParam({ name: 'tokenType', example: 'USDT' })
  @ApiParam({ name: 'blockchain', example: 'POLYGON' })
  @ApiParam({ name: 'network', example: 'mainnet' })
  @ApiResponse({
    status: 200,
    description: 'Network configuration retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Network configuration not found',
  })
  async getConfig(@Param() params: NetworkConfigParamsDto) {
    try {
      const config = await this.networkConfigService.getNetworkConfig(
        params.tokenType,
        params.blockchain,
        params.network,
      );

      if (!config) {
        return {
          success: false,
          message: 'Network configuration not found',
        };
      }

      return {
        success: true,
        data: config,
      };
    } catch (error) {
      this.logger.error(
        `Error getting network config: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Create or update a network configuration
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create or update network configuration',
    description:
      'Creates a new network configuration or updates an existing one',
  })
  @ApiResponse({
    status: 201,
    description: 'Network configuration created/updated successfully',
  })
  async upsertConfig(
    @Body() dto: UpsertNetworkConfigDto,
    @Request() req: Express.Request & { user: { userId: string } },
  ) {
    try {
      const config = await this.networkConfigService.upsertNetworkConfig(
        dto,
        req.user.userId,
      );

      this.logger.log(
        `Network config ${config.tokenType}/${config.blockchain}/${config.network} upserted by admin ${req.user.userId}`,
      );

      return {
        success: true,
        data: config,
        message: 'Network configuration saved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error upserting network config: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Toggle network enabled/disabled
   * Requires MFA re-authentication
   */
  @Patch(':tokenType/:blockchain/:network/toggle')
  @UseGuards(ReAuthGuard)
  @ApiOperation({
    summary: 'Toggle network enabled status',
    description:
      'Enables or disables a network configuration. Requires MFA re-authentication.',
  })
  @ApiParam({ name: 'tokenType', example: 'USDT' })
  @ApiParam({ name: 'blockchain', example: 'POLYGON' })
  @ApiParam({ name: 'network', example: 'mainnet' })
  @ApiResponse({
    status: 200,
    description: 'Network status toggled successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Network configuration not found',
  })
  @ApiResponse({
    status: 428,
    description: 'MFA re-authentication required',
  })
  async toggleNetwork(
    @Param() params: NetworkConfigParamsDto,
    @Body() dto: ToggleNetworkDto,
    @Request() req: Express.Request & { user: { userId: string } },
  ) {
    try {
      const config = await this.networkConfigService.toggleNetwork(
        params.tokenType,
        params.blockchain,
        params.network,
        dto.isEnabled,
        req.user.userId,
      );

      this.logger.log(
        `Network ${config.tokenType}/${config.blockchain}/${config.network} ${config.isEnabled ? 'enabled' : 'disabled'} by admin ${req.user.userId}`,
      );

      return {
        success: true,
        data: config,
        message: `Network ${config.isEnabled ? 'enabled' : 'disabled'} successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Error toggling network: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Delete a network configuration
   * Requires MFA re-authentication
   */
  @Delete(':tokenType/:blockchain/:network')
  @UseGuards(ReAuthGuard)
  @ApiOperation({
    summary: 'Delete network configuration',
    description:
      'Permanently deletes a network configuration. Requires MFA re-authentication.',
  })
  @ApiParam({ name: 'tokenType', example: 'USDT' })
  @ApiParam({ name: 'blockchain', example: 'POLYGON' })
  @ApiParam({ name: 'network', example: 'mainnet' })
  @ApiResponse({
    status: 200,
    description: 'Network configuration deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Network configuration not found',
  })
  @ApiResponse({
    status: 428,
    description: 'MFA re-authentication required',
  })
  async deleteConfig(
    @Param() params: NetworkConfigParamsDto,
    @Request() req: Express.Request & { user: { userId: string } },
  ) {
    try {
      await this.networkConfigService.deleteNetworkConfig(
        params.tokenType,
        params.blockchain,
        params.network,
      );

      this.logger.warn(
        `Network config ${params.tokenType}/${params.blockchain}/${params.network} deleted by admin ${req.user.userId}`,
      );

      return {
        success: true,
        message: 'Network configuration deleted successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error deleting network config: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../auth/decorators';
import { AdminSecurityService } from './admin-security.service';
import {
  CreateIpWhitelistDto,
  UpdateIpWhitelistDto,
} from './dto/ip-whitelist.dto';

@ApiTags('Admin - Security')
@ApiBearerAuth('JWT-auth')
@Controller('admin/security/ip-whitelist')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN) // Only SUPER_ADMIN can manage IP whitelist
export class AdminSecurityController {
  constructor(private readonly adminSecurityService: AdminSecurityService) {}

  @ApiOperation({
    summary: 'Get all whitelisted IPs',
    description:
      'List all IP addresses whitelisted for admin access with pagination.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'IP whitelist entries retrieved successfully',
  })
  @Get()
  async getIpWhitelist(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isActive') isActive?: boolean,
    @Query('userId') userId?: string,
  ) {
    return this.adminSecurityService.getIpWhitelist({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      isActive: isActive !== undefined ? isActive === true : undefined,
      userId: userId || undefined,
    });
  }

  @ApiOperation({
    summary: 'Add IP to whitelist',
    description:
      'Add a new IP address or CIDR range to the whitelist. Can be global (all admins) or user-specific.',
  })
  @ApiResponse({
    status: 201,
    description: 'IP address added to whitelist successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid IP address format' })
  @ApiResponse({ status: 409, description: 'IP address already whitelisted' })
  @Post()
  async addIpWhitelist(
    @Body() dto: CreateIpWhitelistDto,
    @GetUser('id') userId: string,
  ) {
    return this.adminSecurityService.addIpWhitelist(dto, userId);
  }

  @ApiOperation({
    summary: 'Update IP whitelist entry',
    description:
      'Update description or active status of an IP whitelist entry.',
  })
  @ApiParam({ name: 'id', description: 'IP whitelist entry ID' })
  @ApiResponse({
    status: 200,
    description: 'IP whitelist entry updated successfully',
  })
  @ApiResponse({ status: 404, description: 'IP whitelist entry not found' })
  @Patch(':id')
  async updateIpWhitelist(
    @Param('id') id: string,
    @Body() dto: UpdateIpWhitelistDto,
  ) {
    return this.adminSecurityService.updateIpWhitelist(id, dto);
  }

  @ApiOperation({
    summary: 'Remove IP from whitelist',
    description: 'Remove an IP address or CIDR range from the whitelist.',
  })
  @ApiParam({ name: 'id', description: 'IP whitelist entry ID' })
  @ApiResponse({
    status: 200,
    description: 'IP address removed from whitelist successfully',
  })
  @ApiResponse({ status: 404, description: 'IP whitelist entry not found' })
  @Delete(':id')
  async removeIpWhitelist(@Param('id') id: string) {
    return this.adminSecurityService.removeIpWhitelist(id);
  }

  /**
   * Get current client IP address
   */
  @Get('current-ip')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get current client IP',
    description:
      'Returns the IP address of the current client making the request.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current IP address',
    schema: {
      type: 'object',
      properties: {
        ipAddress: { type: 'string', example: '192.168.1.1' },
      },
    },
  })
  async getCurrentIp(@Req() request: Request) {
    // Extract IP from request (same logic as IpWhitelistGuard)
    const xForwardedFor = request.headers['x-forwarded-for'];
    let clientIp: string;

    if (xForwardedFor && typeof xForwardedFor === 'string') {
      clientIp = xForwardedFor.split(',')[0].trim();
    } else if (Array.isArray(xForwardedFor) && xForwardedFor.length > 0) {
      clientIp = xForwardedFor[0].trim();
    } else {
      const xRealIp = request.headers['x-real-ip'];
      if (xRealIp && typeof xRealIp === 'string') {
        clientIp = xRealIp;
      } else if (request.ip) {
        clientIp = request.ip;
      } else if (request.socket?.remoteAddress) {
        clientIp = request.socket.remoteAddress;
      } else {
        clientIp = 'unknown';
      }
    }

    return { ipAddress: clientIp };
  }
}

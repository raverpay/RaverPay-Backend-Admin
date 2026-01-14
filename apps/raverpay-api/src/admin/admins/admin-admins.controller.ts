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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { UserStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ReAuthGuard } from '../../common/guards/re-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { AuthenticatedRequest } from '../../common/types/auth.types';
import { AdminAdminsService } from './admin-admins.service';
import {
  CreateAdminDto,
  UpdateAdminDto,
  ResetPasswordDto,
  ProvisionAdminDto,
} from '../dto/admin.dto';

@ApiTags('Admin - Admins')
@ApiBearerAuth('JWT-auth')
@Controller('admin/admins')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN) // Only SUPER_ADMIN can manage admins
export class AdminAdminsController {
  constructor(private readonly adminAdminsService: AdminAdminsService) {}

  @ApiOperation({ summary: 'Get paginated list of admin users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @Get()
  async getAdmins(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminAdminsService.getAdmins(
      page,
      limit,
      role as UserRole | undefined,
      status as UserStatus | undefined,
      search,
    );
  }

  @ApiOperation({ summary: 'Get admin statistics' })
  @Get('stats')
  async getStats() {
    return this.adminAdminsService.getStats();
  }

  @ApiOperation({ summary: 'Get single admin details' })
  @ApiParam({ name: 'adminId', description: 'Admin ID' })
  @Get(':adminId')
  async getAdminById(@Param('adminId') adminId: string) {
    return this.adminAdminsService.getAdminById(adminId);
  }

  @ApiOperation({
    summary: 'Create new admin user',
    description: 'Requires re-authentication for this sensitive operation',
  })
  @UseGuards(ReAuthGuard)
  @Post()
  async createAdmin(
    @GetUser('id') userId: string,
    @Body() dto: CreateAdminDto,
  ) {
    return this.adminAdminsService.createAdmin(userId, dto);
  }

  @ApiOperation({
    summary: 'Update admin user',
    description: 'Requires re-authentication for this sensitive operation',
  })
  @ApiParam({ name: 'adminId', description: 'Admin ID' })
  @UseGuards(ReAuthGuard)
  @Patch(':adminId')
  async updateAdmin(
    @GetUser('id') userId: string,
    @Param('adminId') adminId: string,
    @Body() dto: UpdateAdminDto,
  ) {
    return this.adminAdminsService.updateAdmin(userId, adminId, dto);
  }

  @ApiOperation({
    summary: 'Delete (deactivate) admin user',
    description: 'Requires re-authentication for this sensitive operation',
  })
  @ApiParam({ name: 'adminId', description: 'Admin ID' })
  @UseGuards(ReAuthGuard)
  @Delete(':adminId')
  async deleteAdmin(
    @GetUser('id') userId: string,
    @Param('adminId') adminId: string,
  ) {
    return this.adminAdminsService.deleteAdmin(userId, adminId);
  }

  @ApiOperation({
    summary: 'Reset admin password',
    description: 'Requires re-authentication for this sensitive operation',
  })
  @ApiParam({ name: 'adminId', description: 'Admin ID' })
  @UseGuards(ReAuthGuard)
  @Post(':adminId/reset-password')
  async resetPassword(
    @GetUser('id') userId: string,
    @Param('adminId') adminId: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.adminAdminsService.resetPassword(userId, adminId, dto.password);
  }

  @ApiOperation({
    summary: 'Provision admin account',
    description:
      'Add IP to whitelist, optionally generate MFA setup, and send provisioning email. Requires re-authentication.',
  })
  @ApiParam({ name: 'adminId', description: 'Admin ID' })
  @UseGuards(ReAuthGuard)
  @Post(':adminId/provision')
  async provisionAdmin(
    @GetUser('id') userId: string,
    @Param('adminId') adminId: string,
    @Body() dto: ProvisionAdminDto,
  ) {
    return this.adminAdminsService.provisionAdmin(userId, adminId, dto);
  }
}

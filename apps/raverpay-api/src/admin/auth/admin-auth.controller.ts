import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from '../../auth/decorators';
import { SkipPasswordChangeCheck } from '../../common/decorators/skip-password-change-check.decorator';
import { DeviceInfo } from '../../device/device.service';

/**
 * Admin Authentication Controller
 *
 * Handles admin-specific authentication operations like password change on first login
 */
@Controller('admin/auth')
@ApiTags('Admin - Authentication')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  /**
   * Change password (for first login or forced change)
   *
   * Requires:
   * - passwordChangeToken from login response
   * - Current password
   * - New password (with confirmation)
   * - MFA code (if MFA is enabled)
   */
  @Public() // Public because user is not yet fully authenticated
  @SkipPasswordChangeCheck() // Skip password change check for this endpoint
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change password on first login',
    description:
      'Change password for admin users who must change password on first login. Requires password-change token from login response, current password, new password, and MFA code (if MFA enabled).',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully, returns access tokens',
    schema: {
      example: {
        user: {
          id: 'user_123',
          email: 'admin@example.com',
          role: 'ADMIN',
        },
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        reAuthToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 1800,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input, passwords do not match, or MFA code required',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid current password, MFA code, or expired token',
  })
  async changePassword(@Body() dto: ChangePasswordDto, @Req() req: Request) {
    // Extract IP address
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown';

    // Extract device info from headers if available
    const deviceInfo: DeviceInfo | undefined = req.headers['x-device-id']
      ? {
          deviceId: req.headers['x-device-id'] as string,
          deviceName: (req.headers['x-device-name'] as string) || 'Unknown',
          deviceType: ((req.headers['x-device-type'] as string) || 'web') as
            | 'ios'
            | 'android'
            | 'web',
          deviceModel: req.headers['x-device-model'] as string | undefined,
          osVersion: req.headers['x-os-version'] as string | undefined,
          appVersion: req.headers['x-app-version'] as string | undefined,
          ipAddress: ipAddress,
          userAgent: req.headers['user-agent'] || undefined,
        }
      : undefined;

    return this.adminAuthService.changePassword(
      dto.passwordChangeToken,
      dto,
      deviceInfo,
      ipAddress,
    );
  }
}

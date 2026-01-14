import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest, isAdminUser } from '../types/auth.types';

/**
 * Must Change Password Guard
 *
 * Blocks access to admin routes if user must change password on first login.
 * Applied globally to all admin routes except password change, logout, refresh endpoints.
 */
@Injectable()
export class MustChangePasswordGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    // If no user (public route), allow
    if (!user?.id) {
      return true;
    }

    // Only apply to admin users
    if (!isAdminUser(user)) {
      return true; // Not an admin, skip password change check
    }

    // Check if route should skip password change check
    const skipPasswordChangeCheck = this.reflector.getAllAndOverride<boolean>(
      'skipPasswordChangeCheck',
      [context.getHandler(), context.getClass()],
    );

    if (skipPasswordChangeCheck) {
      return true;
    }

    // Check if user must change password
    if (user.mustChangePassword === true) {
      throw new HttpException(
        {
          statusCode: 428,
          message:
            'Password change required. Please change your password before accessing this resource.',
          error: 'PasswordChangeRequired',
          mustChangePassword: true,
        },
        428, // Precondition Required
      );
    }

    return true;
  }
}

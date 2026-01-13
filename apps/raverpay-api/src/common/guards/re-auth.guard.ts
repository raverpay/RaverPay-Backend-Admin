import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedRequest } from '../types/auth.types';

/**
 * Re-Authentication Guard
 *
 * Requires users to re-authenticate (provide password) for sensitive operations.
 * Checks for X-Recent-Auth-Token header which is generated after password verification.
 * Token must be less than 15 minutes old.
 */
@Injectable()
export class ReAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    // Check if recently authenticated (within last 15 minutes)
    const recentAuthHeader = request.headers['x-recent-auth-token'];
    const recentAuth =
      typeof recentAuthHeader === 'string'
        ? recentAuthHeader
        : Array.isArray(recentAuthHeader)
          ? recentAuthHeader[0]
          : undefined;

    if (!recentAuth) {
      throw new HttpException(
        {
          statusCode: 428,
          message: 'Re-authentication required for this sensitive operation',
          error: 'ReAuthenticationRequired',
        },
        428, // Precondition Required
      );
    }

    // Verify the re-auth token (short-lived JWT)
    try {
      interface ReAuthTokenPayload {
        sub: string;
        purpose: string;
        iat: number;
      }

      const payload = this.jwtService.verify<ReAuthTokenPayload>(recentAuth);

      if (payload.sub !== user.id || payload.purpose !== 'reauth') {
        throw new UnauthorizedException('Invalid re-authentication token');
      }

      // Check if token is recent (< 15 minutes old)
      const tokenAge = Date.now() - payload.iat * 1000;
      if (tokenAge > 15 * 60 * 1000) {
        throw new HttpException(
          {
            statusCode: 428,
            message: 'Re-authentication token expired',
            error: 'ReAuthenticationRequired',
          },
          428,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          statusCode: 428,
          message: 'Re-authentication required',
          error: 'ReAuthenticationRequired',
        },
        428,
      );
    }
  }
}

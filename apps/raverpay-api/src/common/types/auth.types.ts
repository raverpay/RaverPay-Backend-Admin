import { User } from '@prisma/client';
import type { Request } from 'express';

/**
 * Authenticated user type (User without password)
 * This is what gets attached to request.user after JWT validation
 */
export type AuthenticatedUser = Omit<User, 'password'>;

/**
 * Express Request with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Type guard to check if user is admin
 */
export function isAdminUser(
  user: AuthenticatedUser | undefined,
): user is AuthenticatedUser & {
  role: 'ADMIN' | 'SUPPORT' | 'SUPER_ADMIN';
} {
  return (
    !!user &&
    (user.role === 'ADMIN' ||
      user.role === 'SUPPORT' ||
      user.role === 'SUPER_ADMIN')
  );
}

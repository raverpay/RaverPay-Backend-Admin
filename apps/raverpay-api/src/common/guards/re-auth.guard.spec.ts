import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException, HttpException } from '@nestjs/common';
import { ReAuthGuard } from './re-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedRequest } from '../types/auth.types';

describe('ReAuthGuard', () => {
  let guard: ReAuthGuard;

  const mockJwtService = {
    verify: jest.fn(),
  };

  const createMockContext = (
    user: { id: string; email?: string },
    reAuthToken?: string,
  ): ExecutionContext => {
    const request = {
      user,
      headers: {
        'x-recent-auth-token': reAuthToken,
      },
      get: jest.fn((header: string) => {
        if (header.toLowerCase() === 'x-recent-auth-token') {
          return reAuthToken;
        }
        return undefined;
      }),
    } as unknown as AuthenticatedRequest;

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReAuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<ReAuthGuard>(ReAuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should allow request with valid recent auth token', () => {
      const user = { id: 'user-1', email: 'user@test.com' };
      const validToken = 'valid-reauth-token';

      mockJwtService.verify.mockReturnValue({
        sub: user.id,
        purpose: 'reauth',
        email: user.email,
        iat: Math.floor(Date.now() / 1000) - 300, // 5 minutes ago
      });

      const context = createMockContext(user, validToken);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockJwtService.verify).toHaveBeenCalledWith(validToken);
    });

    it('should reject request without re-auth token', () => {
      const user = { id: 'user-1' };
      const context = createMockContext(user);

      expect(() => guard.canActivate(context)).toThrow(HttpException);
    });

    it('should reject request with expired token', () => {
      const user = { id: 'user-1' };
      const expiredToken = 'expired-token';

      mockJwtService.verify.mockReturnValue({
        sub: user.id,
        purpose: 'reauth',
        iat: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      });

      const context = createMockContext(user, expiredToken);

      expect(() => guard.canActivate(context)).toThrow(HttpException);
    });

    it('should reject request with invalid token', () => {
      const user = { id: 'user-1' };
      const invalidToken = 'invalid-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const context = createMockContext(user, invalidToken);

      expect(() => guard.canActivate(context)).toThrow(HttpException);
    });

    it('should reject token with wrong purpose', () => {
      const user = { id: 'user-1' };
      const wrongToken = 'wrong-purpose-token';

      mockJwtService.verify.mockReturnValue({
        sub: user.id,
        purpose: 'access', // Wrong purpose
        iat: Math.floor(Date.now() / 1000) - 300,
      });

      const context = createMockContext(user, wrongToken);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should reject token for different user', () => {
      const user = { id: 'user-1', email: 'user@test.com' };
      const token = 'different-user-token';

      mockJwtService.verify.mockReturnValue({
        sub: 'different-user-id',
        purpose: 'reauth',
        email: 'different@test.com',
        iat: Math.floor(Date.now() / 1000) - 300,
      });

      const context = createMockContext(user, token);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });
  });
});

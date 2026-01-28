import {
  ExceptionFilter,
  Catch,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import { SentryService } from '../sentry/sentry.service';
import { BetterStackService } from '../logging/better-stack.service';
import { SentryExceptionCaptured } from '@sentry/nestjs';

/**
 * Sentry Exception Filter
 *
 * Captures all exceptions and sends them to Sentry with context.
 * Also logs all HTTP errors to Better Stack.
 */
@Injectable()
@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly sentryService: SentryService,
    private readonly betterStackService: BetterStackService,
  ) {}

  @SentryExceptionCaptured()
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Get status code
    let status: number;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
    } else if (exception instanceof Error) {
      // For validation/input errors, use 400 instead of 500
      const errorMessage = exception.message?.toLowerCase() || '';
      if (
        errorMessage.includes('invalid') ||
        errorMessage.includes('missing') ||
        errorMessage.includes('required') ||
        errorMessage.includes('format') ||
        errorMessage.includes('not found')
      ) {
        status = HttpStatus.BAD_REQUEST;
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    // Get error message
    let message: string | object;
    if (exception instanceof HttpException) {
      message = exception.getResponse();
    } else if (exception instanceof Error) {
      // For non-HTTP exceptions, return the error message with 400 status for validation errors
      // or 500 for unexpected errors
      const errorMessage = exception.message || 'Internal server error';
      // Check if it's a validation/input error (common patterns)
      if (
        errorMessage.toLowerCase().includes('invalid') ||
        errorMessage.toLowerCase().includes('missing') ||
        errorMessage.toLowerCase().includes('required') ||
        errorMessage.toLowerCase().includes('format') ||
        errorMessage.toLowerCase().includes('not found')
      ) {
        // Return as BadRequestException message format
        message = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: errorMessage,
          error: 'Bad Request',
        };
      } else {
        message = errorMessage;
      }
    } else {
      message = 'Internal server error';
    }

    // Extract user ID from request if available
    const userId = (request as any).user?.id || (request as any).user?.userId;

    // Set user context in Sentry
    if (userId) {
      this.sentryService.setUser({
        id: userId,
        email: (request as any).user?.email,
        username: (request as any).user?.username,
      });
    }

    // Set request context
    this.sentryService.setContext('request', {
      method: request.method,
      url: request.url,
      headers: this.sanitizeHeaders(request.headers),
      query: request.query,
      body: this.sanitizeBody(request.body),
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    // Add breadcrumb
    this.sentryService.addBreadcrumb({
      category: 'http',
      message: `${request.method} ${request.url}`,
      level: status >= 500 ? 'error' : 'warning',
      data: {
        status,
        method: request.method,
        url: request.url,
      },
    });

    // Capture exception (only for server errors or if explicitly configured)
    if (status >= 500 || process.env.SENTRY_CAPTURE_ALL === 'true') {
      this.sentryService.captureException(exception, {
        request: {
          method: request.method,
          url: request.url,
          headers: this.sanitizeHeaders(request.headers),
          query: request.query,
          body: this.sanitizeBody(request.body),
        },
        userId,
        status,
      });
    }

    // Log to Better Stack
    const errorLog = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      userId: userId || 'anonymous',
      ip: request.ip,
      userAgent: request.get('user-agent'),
      contentType: request.get('content-type') || 'unknown',
      requestId: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      statusCode: status,
      error: {
        name:
          exception instanceof Error
            ? exception.constructor.name
            : 'UnknownError',
        message:
          typeof message === 'string'
            ? message
            : (message as any).message || 'Unknown error',
      },
      success: false,
    };

    this.betterStackService.info('HTTP Request Failed', errorLog);

    // Send response
    // If message is already an object (from HttpException or our custom format), use it
    if (
      typeof message === 'object' &&
      message !== null &&
      'statusCode' in message
    ) {
      response.status((message as any).statusCode || status).json({
        ...message,
        timestamp: new Date().toISOString(),
        path: request.url,
        ...(process.env.NODE_ENV !== 'production' && {
          error: exception instanceof Error ? exception.stack : undefined,
        }),
      });
    } else {
      // Otherwise, format as standard error response
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message:
          typeof message === 'string'
            ? message
            : (message as any).message || 'Internal server error',
        ...(process.env.NODE_ENV !== 'production' && {
          error: exception instanceof Error ? exception.stack : undefined,
        }),
      });
    }
  }

  /**
   * Sanitize headers to remove sensitive data
   */
  private sanitizeHeaders(headers: any): Record<string, any> {
    const sensitive = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
    const sanitized = { ...headers };

    sensitive.forEach((key) => {
      if (sanitized[key]) {
        sanitized[key] = '[Filtered]';
      }
    });

    return sanitized;
  }

  /**
   * Sanitize request body to remove sensitive data
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitive = ['password', 'pin', 'bvn', 'nin', 'token'];
    const sanitized = { ...body };

    sensitive.forEach((key) => {
      if (sanitized[key]) {
        sanitized[key] = '[Filtered]';
      }
    });

    return sanitized;
  }
}

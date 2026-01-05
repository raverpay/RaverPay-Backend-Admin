import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { CircleWebhookService } from './circle-webhook.service';
import type { CircleWebhookEvent } from '../circle.types';
import { Public } from '../../auth/decorators/public.decorator';
import { AuditService } from '../../common/services/audit.service';
import {
  AuditAction,
  ActorType,
  AuditStatus,
} from '../../common/types/audit-log.types';

/**
 * Circle Webhook Controller
 * Handles incoming webhooks from Circle
 *
 * This endpoint is public (no auth required) but verifies Circle's signature
 */
@Controller('circle/webhooks')
export class CircleWebhookController {
  private readonly logger = new Logger(CircleWebhookController.name);

  constructor(
    private readonly webhookService: CircleWebhookService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Receive webhook from Circle
   * POST /circle/webhooks
   */
  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() event: any,
    @Headers('circle-signature') signature?: string,
    @Headers('circle-timestamp') timestamp?: string,
  ): Promise<{ received: boolean }> {
    const webhookEvent = event as CircleWebhookEvent;

    this.logger.log(
      `Webhook received: ${webhookEvent.notificationType} - ${webhookEvent.notificationId}`,
    );

    // Audit log for webhook received
    await this.auditService.log({
      userId: null,
      action: AuditAction.WEBHOOK_RECEIVED,
      resource: 'WEBHOOK',
      metadata: {
        provider: 'circle',
        notificationType: webhookEvent.notificationType,
        notificationId: webhookEvent.notificationId,
        subscriptionId: webhookEvent.subscriptionId,
      },
      actorType: ActorType.SYSTEM,
    });

    // Verify signature if provided
    if (signature && timestamp) {
      const isValid = this.webhookService.verifySignature(
        JSON.stringify(event),
        signature,
        timestamp,
      );

      if (!isValid) {
        this.logger.warn('Invalid webhook signature');
        throw new BadRequestException('Invalid webhook signature');
      }
    }

    // Process webhook asynchronously
    // We return immediately to acknowledge receipt
    void this.processWebhookAsync(webhookEvent);

    return { received: true };
  }

  /**
   * Process webhook asynchronously
   */
  private async processWebhookAsync(event: CircleWebhookEvent): Promise<void> {
    try {
      await this.webhookService.processWebhook(event);

      // Audit log for successful processing
      await this.auditService.log({
        userId: null,
        action: AuditAction.WEBHOOK_PROCESSED,
        resource: 'WEBHOOK',
        metadata: {
          provider: 'circle',
          notificationType: event.notificationType,
          notificationId: event.notificationId,
        },
        actorType: ActorType.SYSTEM,
        status: AuditStatus.SUCCESS,
      });
    } catch (error) {
      this.logger.error('Webhook processing error:', error);

      // Audit log for webhook processing failure
      await this.auditService.log({
        userId: null,
        action: AuditAction.WEBHOOK_FAILED,
        resource: 'WEBHOOK',
        metadata: {
          provider: 'circle',
          notificationType: event.notificationType,
          notificationId: event.notificationId,
          error: error.message,
        },
        actorType: ActorType.SYSTEM,
        status: AuditStatus.FAILURE,
        errorMessage: error.message,
      });
      // Error is already logged in service
    }
  }

  /**
   * Health check for webhook endpoint
   * Used by Circle to verify endpoint is reachable
   */
  @Public()
  @Post('health')
  @HttpCode(HttpStatus.OK)
  healthCheck(): { status: string } {
    return { status: 'ok' };
  }
}

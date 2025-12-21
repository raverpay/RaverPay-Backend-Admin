import { Controller, Get, Injectable } from '@nestjs/common';
import { LogtailService } from '../common/logging/logtail.service';

/**
 * Diagnostic Controller for Testing Logtail
 * 
 * This controller provides endpoints to test if Logtail is working correctly.
 * Access: GET /api/diagnostic/logtail-test
 */
@Controller('diagnostic')
export class DiagnosticController {
  constructor(private readonly logtailService: LogtailService) {}

  @Get('logtail-test')
  async testLogtail() {
    const timestamp = new Date().toISOString();
    
    // Check if Logtail is enabled
    const isEnabled = this.logtailService.isEnabled();
    
    if (!isEnabled) {
      return {
        success: false,
        message: 'Logtail is NOT enabled',
        timestamp,
        instructions: 'Check LOGTAIL_SOURCE_TOKEN in .env file',
      };
    }

    // Send test log
    try {
      await this.logtailService.info('Diagnostic test log from API endpoint', {
        test: true,
        timestamp,
        endpoint: '/diagnostic/logtail-test',
        message: 'This is a test log to verify Logtail integration',
      });

      // Flush to ensure it's sent immediately
      await this.logtailService.flush();

      return {
        success: true,
        message: 'Test log sent to Better Stack successfully!',
        timestamp,
        instructions: [
          'Check Better Stack dashboard:',
          'https://telemetry.betterstack.com/team/t486268/tail?s=1641618',
          'Look for message: "Diagnostic test log from API endpoint"',
        ],
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send log to Logtail',
        error: error.message,
        timestamp,
      };
    }
  }

  @Get('logtail-status')
  getLogtailStatus() {
    return {
      enabled: this.logtailService.isEnabled(),
      message: this.logtailService.isEnabled()
        ? 'Logtail is enabled and ready'
        : 'Logtail is NOT enabled - check LOGTAIL_SOURCE_TOKEN',
    };
  }
}

import { Module, Global } from '@nestjs/common';
import { LogtailService } from './logtail.service';
import { CustomLoggerService } from './custom-logger.service';
import { BetterStackService } from './better-stack.service';

/**
 * Logtail Module
 *
 * Provides Logtail logging service globally.
 * Also provides BetterStackService for direct HTTP logging.
 */
@Global()
@Module({
  providers: [LogtailService, CustomLoggerService, BetterStackService],
  exports: [LogtailService, CustomLoggerService, BetterStackService],
})
export class LogtailModule {}

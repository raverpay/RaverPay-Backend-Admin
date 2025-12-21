import { Module } from '@nestjs/common';
import { DiagnosticController } from './diagnostic.controller';
import { LogtailModule } from '../common/logging/logtail.module';

@Module({
  imports: [LogtailModule],
  controllers: [DiagnosticController],
})
export class DiagnosticModule {}

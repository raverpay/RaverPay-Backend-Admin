import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BVNEncryptionService } from './bvn-encryption.service';
import { MfaEncryptionUtil } from './mfa-encryption.util';

/**
 * Utils Module
 *
 * Provides utility services like BVN encryption and MFA encryption
 * Made global so it can be imported by any module
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [BVNEncryptionService, MfaEncryptionUtil],
  exports: [BVNEncryptionService, MfaEncryptionUtil],
})
export class UtilsModule {}

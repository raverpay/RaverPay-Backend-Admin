import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ISmsProvider } from './interfaces/sms-provider.interface';
import { VTPassProvider } from './providers/vtpass.provider';
import { TermiiProvider } from './providers/termii.provider';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly provider: ISmsProvider;

  constructor(private configService: ConfigService) {
    // Determine which SMS provider to use
    const smsProvider = this.configService
      .get<string>('SMS_PROVIDER', 'termii')
      .toLowerCase();

    // Initialize the appropriate provider
    if (smsProvider === 'vtpass') {
      this.provider = new VTPassProvider(configService);
      this.logger.log('📱 SMS Service using provider: VTPass');
    } else if (smsProvider === 'termii') {
      this.provider = new TermiiProvider(configService);
      this.logger.log('📱 SMS Service using provider: Termii');
    } else {
      // Default to Termii
      this.logger.warn(
        `⚠️  Unknown SMS provider "${smsProvider}", defaulting to Termii`,
      );
      this.provider = new TermiiProvider(configService);
    }
  }

  /**
   * Send verification code SMS
   */
  async sendVerificationCode(
    phone: string,
    code: string,
    firstName: string,
  ): Promise<boolean> {
    return this.provider.sendVerificationCode(phone, code, firstName);
  }

  /**
   * Send password reset SMS
   */
  async sendPasswordResetSms(
    phone: string,
    code: string,
    firstName: string,
  ): Promise<boolean> {
    return this.provider.sendPasswordResetSms(phone, code, firstName);
  }

  /**
   * Send transaction alert SMS
   */
  async sendTransactionAlert(
    phone: string,
    firstName: string,
    transactionDetails: {
      type: string;
      amount: string;
      reference: string;
    },
  ): Promise<boolean> {
    return this.provider.sendTransactionAlert(
      phone,
      firstName,
      transactionDetails,
    );
  }

  /**
   * Check SMS balance
   */
  async checkBalance(): Promise<number> {
    return this.provider.checkBalance();
  }

  /**
   * Get current provider name
   */
  getProviderName(): string {
    return this.provider.getProviderName();
  }
}

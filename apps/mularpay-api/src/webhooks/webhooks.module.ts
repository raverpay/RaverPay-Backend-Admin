import { Module } from '@nestjs/common';
import { PaystackWebhookController } from './paystack-webhook.controller';
import { PaystackWebhookService } from './paystack-webhook.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentsModule } from '../payments/payments.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [PrismaModule, PaymentsModule, WalletModule],
  controllers: [PaystackWebhookController],
  providers: [PaystackWebhookService],
  exports: [PaystackWebhookService],
})
export class WebhooksModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PaymentsModule } from './payments/payments.module';
import { VirtualAccountsModule } from './virtual-accounts/virtual-accounts.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { VTUModule } from './vtu/vtu.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    CacheModule, // Add cache module first for global availability
    PrismaModule,
    AuthModule,
    UsersModule,
    WalletModule,
    TransactionsModule,
    PaymentsModule,
    VirtualAccountsModule,
    WebhooksModule,
    VTUModule,
    CloudinaryModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

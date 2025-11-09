import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VirtualAccountsService } from './virtual-accounts.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [ConfigModule, PrismaModule, forwardRef(() => PaymentsModule)],
  providers: [VirtualAccountsService],
  exports: [VirtualAccountsService],
})
export class VirtualAccountsModule {}

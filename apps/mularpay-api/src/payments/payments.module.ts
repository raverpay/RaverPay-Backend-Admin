import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaystackService } from './paystack.service';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [ConfigModule, PrismaModule, TransactionsModule],
  controllers: [PaymentsController],
  providers: [PaystackService],
  exports: [PaystackService],
})
export class PaymentsModule {}

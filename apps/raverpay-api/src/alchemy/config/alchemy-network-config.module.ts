import { Module } from '@nestjs/common';
import { AlchemyNetworkConfigService } from './alchemy-network-config.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AlchemyNetworkConfigService],
  exports: [AlchemyNetworkConfigService],
})
export class AlchemyNetworkConfigModule {}

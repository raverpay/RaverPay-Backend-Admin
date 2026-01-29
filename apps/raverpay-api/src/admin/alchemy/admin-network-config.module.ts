import { Module } from '@nestjs/common';
import { AdminNetworkConfigController } from './controllers/admin-network-config.controller';
import { AlchemyNetworkConfigModule } from '../../alchemy/config/alchemy-network-config.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AlchemyNetworkConfigModule, AuthModule],
  controllers: [AdminNetworkConfigController],
})
export class AdminNetworkConfigModule {}

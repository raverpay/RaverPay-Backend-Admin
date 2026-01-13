import { SetMetadata } from '@nestjs/common';
import { SKIP_IP_WHITELIST_KEY } from '../guards/ip-whitelist.guard';

/**
 * Decorator to skip IP whitelist check for a route
 * Use this for public endpoints or routes that should bypass IP whitelisting
 */
export const SkipIpWhitelist = () => SetMetadata(SKIP_IP_WHITELIST_KEY, true);

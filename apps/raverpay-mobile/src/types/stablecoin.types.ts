/**
 * Stablecoin Types
 * Type definitions for Alchemy stablecoin wallet functionality
 */

export type StablecoinToken = 'USDT' | 'USDC';

export type StablecoinBlockchain = 'ETHEREUM' | 'POLYGON' | 'ARBITRUM' | 'BSC' | 'SOLANA';

export type StablecoinNetwork =
  | 'mainnet'
  | 'sepolia'
  | 'mumbai'
  | 'amoy'
  | 'bsc-testnet'
  | 'solana-devnet';

export type MonthlyIncomeRange =
  | 'Under ₦100,000'
  | '₦100,000 - ₦500,000'
  | '₦500,000 - ₦2,000,000'
  | '₦2,000,000 - ₦5,000,000'
  | 'Above ₦5,000,000';

export interface StablecoinWallet {
  id: string;
  address: string;
  tokenType: StablecoinToken;
  blockchain: StablecoinBlockchain;
  network: StablecoinNetwork;
  qrCode?: string;
  createdAt: string;
}

export interface CreateStablecoinWalletRequest {
  tokenType: StablecoinToken;
  blockchain: StablecoinBlockchain;
  network: StablecoinNetwork;
  monthlyIncomeRange: MonthlyIncomeRange;
  bankStatementUrl: string;
  termsAccepted: boolean;
}

export interface CreateStablecoinWalletResponse {
  success: boolean;
  data: StablecoinWallet;
}

export interface GetStablecoinWalletsResponse {
  success: boolean;
  data: StablecoinWallet[];
  count: number;
}

export interface GetStablecoinWalletResponse {
  success: boolean;
  data: StablecoinWallet;
  message?: string;
}

export interface NetworkOption {
  network: string;
  label: string;
  isTestnet: boolean;
}

export interface BlockchainOption {
  blockchain: string;
  name: string;
  networks: NetworkOption[];
}

export interface TokenOption {
  type: string;
  name: string;
  symbol: string;
  blockchains: BlockchainOption[];
}

export interface SupportedNetworksResponse {
  success: boolean;
  data: {
    tokens: TokenOption[];
  };
}

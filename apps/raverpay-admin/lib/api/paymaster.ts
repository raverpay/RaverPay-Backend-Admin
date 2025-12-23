import apiClient from '../api-client';
import { PaginatedResponse } from '@/types';

// Paymaster Types
export interface PaymasterUserOperation {
  id: string;
  userOpHash: string;
  sender: string;
  walletId: string;
  blockchain: string;
  transactionHash: string | null;
  status: string;
  estimatedGasUsdc: string;
  actualGasUsdc: string | null;
  permitSignature: string;
  paymasterData: string;
  createdAt: string;
  updatedAt: string;
  wallet?: {
    id: string;
    address: string;
    blockchain: string;
  };
  events: PaymasterEvent[];
}

export interface PaymasterEvent {
  id: string;
  userOpHash: string;
  token: string;
  sender: string;
  nativeTokenPrice: string;
  actualTokenNeeded: string;
  feeTokenAmount: string;
  transactionHash: string;
  blockNumber: number;
  createdAt: string;
}

export interface PaymasterStats {
  totalUserOps: number;
  confirmedUserOps: number;
  pendingUserOps: number;
  totalGasSpentUsdc: string;
  averageGasPerTxUsdc: string;
}

export const paymasterApi = {
  // Get all UserOperations
  getUserOperations: async (
    params?: Record<string, unknown>,
  ): Promise<PaginatedResponse<PaymasterUserOperation>> => {
    const response = await apiClient.get<PaginatedResponse<PaymasterUserOperation>>(
      '/admin/circle/paymaster/user-ops',
      { params },
    );
    return response.data;
  },

  // Get UserOperation by hash
  getUserOperation: async (userOpHash: string): Promise<PaymasterUserOperation> => {
    const response = await apiClient.get<{ success: boolean; data: PaymasterUserOperation }>(
      `/admin/circle/paymaster/user-ops/${userOpHash}`,
    );
    return response.data.data;
  },

  // Get Paymaster statistics
  getStats: async (): Promise<PaymasterStats> => {
    const response = await apiClient.get<{ success: boolean; data: PaymasterStats }>(
      '/admin/circle/paymaster/stats',
    );
    return response.data.data;
  },

  // Get events for a wallet
  getWalletEvents: async (walletId: string): Promise<PaymasterUserOperation[]> => {
    const response = await apiClient.get<{ success: boolean; data: PaymasterUserOperation[] }>(
      `/admin/circle/paymaster/events/${walletId}`,
    );
    return response.data.data;
  },

  // Sync events for a block range
  syncEvents: async (params: {
    blockchain: string;
    fromBlock: string;
    toBlock: string;
  }): Promise<{ synced: number }> => {
    const response = await apiClient.post<{ success: boolean; data: { synced: number } }>(
      '/admin/circle/paymaster/sync-events',
      params,
    );
    return response.data.data;
  },
};

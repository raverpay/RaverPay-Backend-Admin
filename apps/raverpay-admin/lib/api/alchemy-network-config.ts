import apiClient from '../api-client';

export interface AlchemyNetworkConfig {
  id: string;
  tokenType: string;
  tokenName: string;
  tokenSymbol: string;
  blockchain: string;
  blockchainName: string;
  network: string;
  networkLabel: string;
  isTestnet: boolean;
  isEnabled: boolean;
  displayOrder: number;
  tokenAddress: string | null;
  decimals: number;
  metadata: Record<string, unknown> | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GroupedNetworkConfig {
  tokenType: string;
  tokenSymbol: string;
  blockchains: {
    blockchain: string;
    blockchainName: string;
    networks: {
      network: string;
      networkLabel: string;
      isTestnet: boolean;
      isEnabled: boolean;
      tokenAddress: string;
      decimals: number;
    }[];
  }[];
}

export interface QueryNetworkConfigParams {
  tokenType?: string;
  blockchain?: string;
  network?: string;
  isEnabled?: boolean;
  isTestnet?: boolean;
}

export interface UpsertNetworkConfigData {
  tokenType: string;
  tokenName: string;
  tokenSymbol: string;
  blockchain: string;
  blockchainName: string;
  network: string;
  networkLabel: string;
  isTestnet: boolean;
  isEnabled: boolean;
  displayOrder: number;
  tokenAddress: string;
  decimals: number;
  metadata?: Record<string, unknown>;
}

export const alchemyNetworkConfigApi = {
  /**
   * Get all network configurations
   */
  getAllConfigs: async (params?: QueryNetworkConfigParams) => {
    const response = await apiClient.get<{
      success: boolean;
      data: AlchemyNetworkConfig[];
      count: number;
    }>('/admin/alchemy/network-config', { params });
    return response.data;
  },

  /**
   * Get enabled networks grouped by token type and blockchain
   */
  getGroupedConfigs: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: GroupedNetworkConfig[];
    }>('/admin/alchemy/network-config/grouped');
    return response.data;
  },

  /**
   * Get a specific network configuration
   */
  getConfig: async (tokenType: string, blockchain: string, network: string) => {
    const response = await apiClient.get<{
      success: boolean;
      data: AlchemyNetworkConfig | null;
      message?: string;
    }>(`/admin/alchemy/network-config/${tokenType}/${blockchain}/${network}`);
    return response.data;
  },

  /**
   * Create or update a network configuration
   */
  upsertConfig: async (data: UpsertNetworkConfigData) => {
    const response = await apiClient.post<{
      success: boolean;
      data: AlchemyNetworkConfig;
      message: string;
    }>('/admin/alchemy/network-config', data);
    return response.data;
  },

  /**
   * Toggle network enabled/disabled status
   * Requires MFA re-authentication (will return 428 if not authenticated)
   */
  toggleNetwork: async (
    tokenType: string,
    blockchain: string,
    network: string,
    isEnabled: boolean,
    reAuthToken?: string,
  ) => {
    const headers: Record<string, string> = {};
    if (reAuthToken) {
      headers['X-Recent-Auth-Token'] = reAuthToken;
    }

    const response = await apiClient.patch<{
      success: boolean;
      data: AlchemyNetworkConfig;
      message: string;
    }>(
      `/admin/alchemy/network-config/${tokenType}/${blockchain}/${network}/toggle`,
      { isEnabled },
      { headers },
    );
    return response.data;
  },

  /**
   * Delete a network configuration
   * Requires MFA re-authentication (will return 428 if not authenticated)
   */
  deleteConfig: async (
    tokenType: string,
    blockchain: string,
    network: string,
    reAuthToken?: string,
  ) => {
    const headers: Record<string, string> = {};
    if (reAuthToken) {
      headers['X-Recent-Auth-Token'] = reAuthToken;
    }

    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/admin/alchemy/network-config/${tokenType}/${blockchain}/${network}`, {
      headers,
    });
    return response.data;
  },
};

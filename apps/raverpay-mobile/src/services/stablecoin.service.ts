// src/services/stablecoin.service.ts
import { apiClient, handleApiError } from '../lib/api/client';
import { API_ENDPOINTS } from '../lib/api/endpoints';
import {
  CreateStablecoinWalletRequest,
  CreateStablecoinWalletResponse,
  GetStablecoinWalletsResponse,
  GetStablecoinWalletResponse,
  StablecoinWallet,
  StablecoinToken,
  StablecoinBlockchain,
  StablecoinNetwork,
  SupportedNetworksResponse,
} from '../types/stablecoin.types';

interface UploadDocumentResponse {
  success: boolean;
  data: {
    fileId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    url: string;
    uploadedAt: string;
  };
  message: string;
}

class StablecoinService {
  /**
   * Get supported networks for stablecoins
   */
  async getSupportedNetworks(): Promise<SupportedNetworksResponse['data']> {
    try {
      const response = await apiClient.get<SupportedNetworksResponse>(
        API_ENDPOINTS.ALCHEMY.STABLECOIN.GET_NETWORKS,
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Upload a document (bank statement, etc.)
   */
  async uploadDocument(file: { uri: string; name: string; type: string }): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      const response = await apiClient.post<UploadDocumentResponse>(
        API_ENDPOINTS.UPLOAD.DOCUMENT,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return response.data.data.fileId;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create or get stablecoin wallet
   */
  async createStablecoinWallet(data: CreateStablecoinWalletRequest): Promise<StablecoinWallet> {
    try {
      const response = await apiClient.post<CreateStablecoinWalletResponse>(
        API_ENDPOINTS.ALCHEMY.STABLECOIN.CREATE_WALLET,
        data,
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get all stablecoin wallets for authenticated user
   */
  async getStablecoinWallets(params?: {
    tokenType?: StablecoinToken;
    blockchain?: StablecoinBlockchain;
    network?: StablecoinNetwork;
  }): Promise<StablecoinWallet[]> {
    try {
      const response = await apiClient.get<GetStablecoinWalletsResponse>(
        API_ENDPOINTS.ALCHEMY.STABLECOIN.GET_WALLETS,
        { params },
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get stablecoin wallet by ID
   */
  async getStablecoinWallet(walletId: string): Promise<StablecoinWallet> {
    try {
      const response = await apiClient.get<GetStablecoinWalletResponse>(
        API_ENDPOINTS.ALCHEMY.STABLECOIN.GET_WALLET(walletId),
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get stablecoin wallet by token/blockchain/network
   */
  async getStablecoinWalletByToken(
    tokenType: StablecoinToken,
    blockchain: StablecoinBlockchain,
    network: StablecoinNetwork,
  ): Promise<StablecoinWallet> {
    try {
      const response = await apiClient.get<GetStablecoinWalletResponse>(
        API_ENDPOINTS.ALCHEMY.STABLECOIN.GET_BY_TOKEN(tokenType, blockchain, network),
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const stablecoinService = new StablecoinService();

// app/stablecoin/creating.tsx
import { ScreenHeader, Text } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/useTheme';
import { apiClient } from '@/src/lib/api/client';
import { stablecoinService } from '@/src/services/stablecoin.service';
import {
  CreateStablecoinWalletRequest,
  MonthlyIncomeRange,
  StablecoinBlockchain,
  StablecoinNetwork,
  StablecoinToken,
} from '@/src/types/stablecoin.types';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

export default function CreatingWalletScreen() {
  const { isDark } = useTheme();
  const params = useLocalSearchParams<{
    tokenType: StablecoinToken;
    blockchain: StablecoinBlockchain;
    network: StablecoinNetwork;
    networkLabel: string;
    monthlyIncomeRange: MonthlyIncomeRange;
    documentUri: string;
    documentName: string;
    documentMimeType: string;
  }>();

  const [status, setStatus] = useState<'uploading' | 'creating' | 'error'>('uploading');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    createWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadDocument = async (): Promise<string> => {
    try {
      setProgress(10);
      const formData = new FormData();

      formData.append('file', {
        uri: params.documentUri,
        name: params.documentName,
        type: params.documentMimeType,
      } as any);

      setProgress(30);

      const response = await apiClient.post<{
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
      }>('/upload/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProgress(50);
      return response.data.data.url;
    } catch (error: any) {
      console.error('Document upload error:', error);
      throw new Error(error?.response?.data?.message || 'Failed to upload document');
    }
  };

  const createWallet = async () => {
    try {
      setStatus('uploading');
      setProgress(10);
      const bankStatementUrl = await uploadDocument();

      setStatus('creating');
      setProgress(60);

      const walletData: CreateStablecoinWalletRequest = {
        tokenType: params.tokenType,
        blockchain: params.blockchain,
        network: params.network,
        monthlyIncomeRange: params.monthlyIncomeRange,
        bankStatementUrl,
        termsAccepted: true,
      };

      const wallet = await stablecoinService.createStablecoinWallet(walletData);

      setProgress(100);

      setTimeout(() => {
        router.replace({
          pathname: '/stablecoin/success',
          params: {
            walletId: wallet.id,
            address: wallet.address,
            tokenType: params.tokenType,
            blockchain: params.blockchain,
            network: params.network,
            networkLabel: params.networkLabel,
          },
        });
      }, 500);
    } catch (error: any) {
      console.error('Wallet creation error:', error);
      setStatus('error');

      Alert.alert(
        'Wallet Creation Failed',
        error?.message || 'Failed to create stablecoin wallet. Please try again.',
        [
          { text: 'Go Back', onPress: () => router.back() },
          {
            text: 'Retry',
            onPress: () => {
              setStatus('uploading');
              setProgress(0);
              createWallet();
            },
          },
        ],
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader title="Creating Wallet" />

      <View className="flex-1 items-center justify-center px-6">
        {status === 'error' ? (
          <View className="items-center">
            <View className="w-24 h-24 items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-full">
              <Ionicons name="close-circle" size={48} color="#ef4444" />
            </View>
            <Text variant="h3" className="mt-6 font-semibold">
              Creation Failed
            </Text>
            <Text
              variant="bodyMedium"
              className="mt-2 text-center text-gray-600 dark:text-gray-400"
            >
              Something went wrong. Please try again.
            </Text>
          </View>
        ) : (
          <View className="items-center">
            <View className="w-24 h-24 items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full">
              {status === 'uploading' ? (
                <Ionicons name="cloud-upload" size={48} color={isDark ? '#60a5fa' : '#3b82f6'} />
              ) : (
                <Ionicons name="wallet" size={48} color={isDark ? '#60a5fa' : '#3b82f6'} />
              )}
            </View>

            <ActivityIndicator
              size="large"
              color={isDark ? '#3b82f6' : '#3b82f6'}
              style={{ marginTop: 24 }}
            />

            <Text variant="h4" className="mt-6 font-semibold">
              {status === 'uploading' ? 'Uploading Document...' : 'Creating Your Wallet...'}
            </Text>

            <Text
              variant="bodyMedium"
              className="mt-2 text-center text-gray-600 dark:text-gray-400"
            >
              {status === 'uploading'
                ? 'Securely uploading your bank statement'
                : 'Setting up your stablecoin address'}
            </Text>

            <View className="w-full h-2 mt-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <View className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
            </View>

            <Text variant="body" className="mt-2 text-gray-600 dark:text-gray-400">
              {progress}%
            </Text>

            <View className="flex-row items-start p-3 mt-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <Ionicons
                name="information-circle"
                size={20}
                color={isDark ? '#60a5fa' : '#3b82f6'}
              />
              <Text variant="body" className="ml-2 flex-1 text-gray-600 dark:text-gray-400">
                This may take a few moments. Please don't close the app.
              </Text>
            </View>

            <View className="mt-6 items-center">
              <Text variant="body" className="text-gray-600 dark:text-gray-400 mb-1">
                Creating wallet for:
              </Text>
              <Text variant="bodyMedium" className="font-semibold">
                {params.networkLabel}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

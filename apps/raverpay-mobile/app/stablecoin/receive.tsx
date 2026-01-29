// app/stablecoin/receive.tsx
import { Button, ScreenHeader, Text } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/useTheme';
import { stablecoinService } from '@/src/services/stablecoin.service';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import { toast } from '@/src/lib/utils/toast';
import NetworkWarningModal from '@/src/components/stablecoin/NetworkWarningModal';

export default function ReceiveScreen() {
  const { isDark } = useTheme();
  const viewShotRef = useRef<ViewShot>(null);
  const [showNetworkWarning, setShowNetworkWarning] = useState(false);
  const [balance, setBalance] = useState<string>('0.00');
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  const params = useLocalSearchParams<{
    walletId: string;
    address: string;
    tokenType: string;
    blockchain: string;
    network: string;
    networkLabel: string;
  }>();

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const response = await stablecoinService.getTokenBalance({
        address: params.address,
        tokenType: params.tokenType as 'USDT' | 'USDC',
        blockchain: params.blockchain as 'ETHEREUM' | 'POLYGON' | 'ARBITRUM' | 'BSC' | 'SOLANA',
        network: params.network as
          | 'mainnet'
          | 'sepolia'
          | 'mumbai'
          | 'amoy'
          | 'bsc-testnet'
          | 'solana-devnet',
      });

      if (response.success && response.data) {
        setBalance(response.data.balance || '0.00');
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Failed to fetch balance');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleCopyAddress = async () => {
    try {
      await Clipboard.setStringAsync(params.address);
      setShowNetworkWarning(true);
      toast.success('Address copied to clipboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to copy address: ${message}`);
    }
  };

  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (!uri) {
        Alert.alert('Error', 'Failed to capture QR code');
        return;
      }

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  const getNetworkColor = (network: string) => {
    const colors: Record<string, string> = {
      Mainnet: '#16a34a',
      Sepolia: '#eab308',
      Goerli: '#eab308',
      'Polygon Mainnet': '#8b5cf6',
      'Polygon Mumbai': '#8b5cf6',
      'Avalanche C-Chain': '#ef4444',
    };
    return colors[network] || '#3b82f6';
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader title="Receive Stablecoins" onBack={() => router.replace('/(tabs)')} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 200,
        }}
      >
        <View className="flex-1 px-6 pt-6">
          {/* Current Balance Card */}
          <View className="w-full p-4 mb-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <View className="flex-row items-center justify-between">
              <View>
                <Text variant="body" className="text-gray-600 dark:text-gray-400 mb-1">
                  Current Balance
                </Text>
                {isLoadingBalance ? (
                  <ActivityIndicator size="small" color={isDark ? '#9ca3af' : '#6b7280'} />
                ) : (
                  <Text variant="h4" className="font-bold">
                    {balance} {params.tokenType}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={fetchBalance}
                disabled={isLoadingBalance}
                className="w-10 h-10 items-center justify-center"
              >
                <Ionicons
                  name="refresh"
                  size={24}
                  color={
                    isLoadingBalance
                      ? isDark
                        ? '#4b5563'
                        : '#d1d5db'
                      : isDark
                        ? '#9ca3af'
                        : '#6b7280'
                  }
                />
              </TouchableOpacity>
            </View>
          </View>

          <View className="items-center">
            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
              <View className="p-6 bg-white dark:bg-gray-800 rounded-3xl items-center">
                <QRCode
                  value={params.address}
                  size={220}
                  backgroundColor={isDark ? '#1f2937' : '#ffffff'}
                  color={isDark ? '#ffffff' : '#000000'}
                />

                <View className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <Text variant="body" className="font-semibold">
                    {params.tokenType}
                  </Text>
                </View>
              </View>
            </ViewShot>

            <View className="w-full p-4 mt-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <View className="flex-row items-center">
                <View
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: getNetworkColor(params.networkLabel) }}
                />
                <Text variant="body" className="text-gray-600 dark:text-gray-400">
                  Network
                </Text>
              </View>
              <Text variant="bodyMedium" className="mt-1 font-semibold">
                {params.networkLabel}
              </Text>
            </View>

            <View className="w-full p-4 mt-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <Text variant="body" className="text-gray-600 dark:text-gray-400 mb-2">
                Wallet Address
              </Text>
              <Pressable
                onPress={handleCopyAddress}
                className="flex-row items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl active:opacity-70"
              >
                <Text
                  variant="body"
                  style={{ fontFamily: 'monospace' }}
                  numberOfLines={1}
                  className="flex-1 mr-2"
                >
                  {params.address}
                </Text>
                <Ionicons name="copy-outline" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              </Pressable>
            </View>

            <View className="w-full p-4 mt-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
              <View className="flex-row items-start">
                <Ionicons name="warning" size={20} color="#f59e0b" />
                <View className="ml-3 flex-1">
                  <Text
                    variant="bodyMedium"
                    className="font-semibold text-amber-900 dark:text-amber-200 mb-1"
                  >
                    Important Notice
                  </Text>
                  <Text variant="body" className="text-amber-800 dark:text-amber-300">
                    Only send {params.tokenType} on {params.networkLabel} to this address. Sending
                    other tokens or using a different network may result in permanent loss of funds.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="p-5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button onPress={handleCopyAddress} variant="outline">
                <View className="flex-row items-center justify-center">
                  <Ionicons name="copy-outline" size={18} color={isDark ? '#9ca3af' : '#6b7280'} />
                  <Text variant="bodyMedium" className="ml-2 font-semibold">
                    Copy
                  </Text>
                </View>
              </Button>
            </View>

            <View className="flex-1">
              <Button onPress={handleShare} variant="primary">
                <View className="flex-row items-center justify-center">
                  <Ionicons name="share-outline" size={18} color="#ffffff" />
                  <Text variant="bodyMedium" className="ml-2 font-semibold text-white">
                    Share
                  </Text>
                </View>
              </Button>
            </View>
          </View>
        </View>

        <NetworkWarningModal
          visible={showNetworkWarning}
          onClose={() => setShowNetworkWarning(false)}
          network={params.networkLabel}
          tokenType={params.tokenType}
        />
      </ScrollView>
    </View>
  );
}

// app/stablecoin/select-token.tsx
import { Button, ScreenHeader, Text } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/useTheme';
import { stablecoinService } from '@/src/services/stablecoin.service';
import {
  BlockchainOption,
  NetworkOption,
  StablecoinBlockchain,
  StablecoinNetwork,
  StablecoinToken,
  TokenOption,
} from '@/src/types/stablecoin.types';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { toast } from '@/src/lib/utils/toast';

export default function SelectTokenScreen() {
  const { isDark } = useTheme();
  const params = useLocalSearchParams<{ preselectedToken?: string }>();
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<TokenOption[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenOption | null>(null);
  const [selectedBlockchain, setSelectedBlockchain] = useState<BlockchainOption | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkOption | null>(null);
  const [showBlockchainPicker, setShowBlockchainPicker] = useState(false);
  const [showNetworkPicker, setShowNetworkPicker] = useState(false);

  useEffect(() => {
    fetchSupportedNetworks();
  }, []);

  const fetchSupportedNetworks = async () => {
    try {
      setLoading(true);
      const data = await stablecoinService.getSupportedNetworks();
      setTokens(data.tokens);

      // Auto-select token if preselectedToken param is provided
      if (params.preselectedToken) {
        const preselected = data.tokens.find((token) => token.type === params.preselectedToken);
        if (preselected) {
          setSelectedToken(preselected);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load supported networks');
      Alert.alert('Error', 'Failed to load networks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!selectedToken || !selectedBlockchain || !selectedNetwork) {
      Alert.alert('Selection Required', 'Please select token, blockchain, and network');
      return;
    }

    try {
      setLoading(true);

      // Check if wallet already exists for this token/blockchain/network
      const existingWallet = await stablecoinService.getStablecoinWalletByToken(
        selectedToken.type as StablecoinToken,
        selectedBlockchain.blockchain as StablecoinBlockchain,
        selectedNetwork.network as StablecoinNetwork,
      );

      // If wallet exists, go directly to receive screen
      if (existingWallet) {
        toast.success('Wallet already exists! Redirecting to receive screen...');
        router.replace({
          pathname: '/stablecoin/receive',
          params: {
            walletId: existingWallet.id,
            address: existingWallet.address,
            tokenType: selectedToken.type,
            blockchain: selectedBlockchain.blockchain,
            network: selectedNetwork.network,
            networkLabel: selectedNetwork.label,
          },
        });
        return;
      }
    } catch (error: any) {
      // If wallet doesn't exist (404), continue to KYC flow
      // Note: error has been transformed by handleApiError, so we check statusCode
      if (error?.statusCode === 404 || error?.response?.status === 404) {
        // Continue to KYC info screen
        router.push({
          pathname: '/stablecoin/kyc-info',
          params: {
            tokenType: selectedToken.type as StablecoinToken,
            blockchain: selectedBlockchain.blockchain as StablecoinBlockchain,
            network: selectedNetwork.network as StablecoinNetwork,
            networkLabel: selectedNetwork.label,
          },
        });
        return;
      }

      // Other errors
      toast.error(error.message || 'Failed to check existing wallet');
      Alert.alert('Error', 'Failed to check if wallet exists. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <ScreenHeader title="Receive Stablecoin" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={isDark ? '#60a5fa' : '#3b82f6'} />
          <Text variant="bodyMedium" className="mt-4 text-gray-600 dark:text-gray-400">
            Loading networks...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader
        title={
          params.preselectedToken ? `Receive ${params.preselectedToken}` : 'Receive Stablecoin'
        }
      />

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View className="p-4 mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={24} color={isDark ? '#60a5fa' : '#3b82f6'} />
            <Text variant="body" className="ml-3 flex-1 text-gray-600 dark:text-gray-400">
              {selectedToken
                ? `Select a blockchain and network to receive ${selectedToken.symbol}. Your wallet will be automatically created.`
                : 'A stablecoin address is required for receiving USDT/USDC. This address will be automatically created for you.'}
            </Text>
          </View>
        </View>

        {/* Token Selection - Only show if not pre-selected */}
        {!params.preselectedToken && (
          <View className="mb-6">
            <Text variant="bodyMedium" className="mb-3 font-semibold">
              Select Token
            </Text>
            <View className="flex-row gap-3">
              {tokens.map((token) => (
                <TouchableOpacity
                  key={token.type}
                  onPress={() => {
                    setSelectedToken(token);
                    setSelectedBlockchain(null);
                    setSelectedNetwork(null);
                    setShowBlockchainPicker(false);
                    setShowNetworkPicker(false);
                  }}
                  className={`flex-1 py-4 px-6 rounded-xl border-2 ${
                    selectedToken?.type === token.type
                      ? token.type === 'USDT'
                        ? 'bg-green-100 dark:bg-green-900/30 border-green-500'
                        : 'bg-blue-100 dark:bg-blue-900/30 border-blue-500'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <Text
                    variant="bodyMedium"
                    className={`text-center font-semibold ${
                      selectedToken?.type === token.type
                        ? token.type === 'USDT'
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-blue-700 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {token.symbol}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Show selected token badge if pre-selected */}
        {params.preselectedToken && selectedToken && (
          <View className="mb-6 flex-row items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <View
              className={`w-12 h-12 items-center justify-center rounded-full ${
                selectedToken.type === 'USDT'
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-blue-100 dark:bg-blue-900/30'
              }`}
            >
              <Ionicons
                name="wallet"
                size={24}
                color={selectedToken.type === 'USDT' ? '#22c55e' : '#3b82f6'}
              />
            </View>
            <View className="ml-4 flex-1">
              <Text variant="bodySmall" className="text-gray-600 dark:text-gray-400 mb-1">
                Selected Token
              </Text>
              <Text variant="bodyLarge" className="font-semibold">
                {selectedToken.name} ({selectedToken.symbol})
              </Text>
            </View>
          </View>
        )}

        {/* Blockchain Selection */}
        {selectedToken && (
          <View className="mb-6">
            <Text variant="bodyMedium" className="mb-3 font-semibold">
              Select Blockchain
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowBlockchainPicker(!showBlockchainPicker);
                setShowNetworkPicker(false);
              }}
              className="flex-row items-center justify-between py-4 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl"
            >
              <Text
                variant="bodyMedium"
                className={selectedBlockchain ? '' : 'text-gray-400 dark:text-gray-500'}
              >
                {selectedBlockchain ? selectedBlockchain.name : 'Choose blockchain...'}
              </Text>
              <Ionicons
                name={showBlockchainPicker ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={isDark ? '#9ca3af' : '#6b7280'}
              />
            </TouchableOpacity>

            {showBlockchainPicker && (
              <View className="mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                {selectedToken.blockchains.map((blockchain, index) => (
                  <TouchableOpacity
                    key={blockchain.blockchain}
                    onPress={() => {
                      setSelectedBlockchain(blockchain);
                      setSelectedNetwork(null);
                      setShowBlockchainPicker(false);
                    }}
                    className={`flex-row items-center justify-between py-4 px-4 ${
                      selectedBlockchain?.blockchain === blockchain.blockchain
                        ? 'bg-gray-100 dark:bg-gray-700'
                        : 'bg-transparent'
                    } ${
                      index < selectedToken.blockchains.length - 1
                        ? 'border-b border-gray-200 dark:border-gray-700'
                        : ''
                    }`}
                  >
                    <Text variant="bodyMedium">{blockchain.name}</Text>
                    {selectedBlockchain?.blockchain === blockchain.blockchain && (
                      <Ionicons name="checkmark" size={20} color="#22c55e" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Network Selection */}
        {selectedBlockchain && (
          <View className="mb-6">
            <Text variant="bodyMedium" className="mb-3 font-semibold">
              Select Network
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowNetworkPicker(!showNetworkPicker);
                setShowBlockchainPicker(false);
              }}
              className="flex-row items-center justify-between py-4 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl"
            >
              <Text
                variant="bodyMedium"
                className={selectedNetwork ? '' : 'text-gray-400 dark:text-gray-500'}
              >
                {selectedNetwork ? selectedNetwork.label : 'Choose network...'}
              </Text>
              <Ionicons
                name={showNetworkPicker ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={isDark ? '#9ca3af' : '#6b7280'}
              />
            </TouchableOpacity>

            {showNetworkPicker && (
              <View className="mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                {selectedBlockchain.networks.map((network, index) => (
                  <TouchableOpacity
                    key={network.network}
                    onPress={() => {
                      setSelectedNetwork(network);
                      setShowNetworkPicker(false);
                    }}
                    className={`flex-row items-center justify-between py-4 px-4 ${
                      selectedNetwork?.network === network.network
                        ? 'bg-gray-100 dark:bg-gray-700'
                        : 'bg-transparent'
                    } ${
                      index < selectedBlockchain.networks.length - 1
                        ? 'border-b border-gray-200 dark:border-gray-700'
                        : ''
                    }`}
                  >
                    <View className="flex-row items-center flex-1">
                      <Text variant="bodyMedium">{network.label}</Text>
                      {network.isTestnet && (
                        <View className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                          <Text
                            variant="bodySmall"
                            className="text-yellow-700 dark:text-yellow-400"
                          >
                            Testnet
                          </Text>
                        </View>
                      )}
                    </View>
                    {selectedNetwork?.network === network.network && (
                      <Ionicons name="checkmark" size={20} color="#22c55e" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View className="p-5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <Button
          onPress={handleContinue}
          disabled={!selectedToken || !selectedBlockchain || !selectedNetwork || loading}
          variant="primary"
        >
          {loading ? 'Checking...' : 'Continue'}
        </Button>
      </View>
    </View>
  );
}

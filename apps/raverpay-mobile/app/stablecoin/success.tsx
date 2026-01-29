// app/stablecoin/success.tsx
import { Button, ScreenHeader, Text } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

export default function SuccessScreen() {
  const { isDark } = useTheme();
  const params = useLocalSearchParams<{
    walletId: string;
    address: string;
    tokenType: string;
    blockchain: string;
    network: string;
    networkLabel: string;
  }>();

  const handleReceiveMoney = () => {
    router.replace({
      pathname: '/stablecoin/receive',
      params,
    });
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader title="" onBack={() => router.replace('/(tabs)')} />

      <View className="flex-1 items-center justify-center px-6">
        <Animated.View
          entering={ZoomIn.duration(500)}
          className="w-30 h-30 items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full"
        >
          <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(200).duration(500)}>
          <Text variant="h3" className="mt-8 font-bold">
            Approved!
          </Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(400).duration(500)} className="w-full">
          <Text variant="body" className="mt-4 text-center text-gray-600 dark:text-gray-400">
            Your stablecoin wallet has been created. You can now view your wallet details to receive
            money.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(600).duration(500)}
          className="w-full p-4 mt-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
        >
          <View className="flex-row items-start">
            <Ionicons name="wallet" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
            <View className="ml-3 flex-1">
              <Text variant="body" className="text-gray-600 dark:text-gray-400 mb-1">
                Wallet Network
              </Text>
              <Text variant="bodyMedium" className="font-semibold">
                {params.networkLabel}
              </Text>
            </View>
          </View>

          <View className="h-px my-4 bg-gray-200 dark:border-gray-700" />

          <View className="flex-row items-start">
            <Ionicons name="location" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
            <View className="ml-3 flex-1">
              <Text variant="body" className="text-gray-600 dark:text-gray-400 mb-1">
                Wallet Address
              </Text>
              <Text variant="body" style={{ fontFamily: 'monospace' }} numberOfLines={1}>
                {params.address}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(800).duration(500)}
          className="flex-row flex-wrap justify-center gap-3 mt-6"
        >
          <View className="flex-row items-center px-3 py-2">
            <View className="w-6 h-6 items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Ionicons name="shield-checkmark" size={14} color={isDark ? '#60a5fa' : '#3b82f6'} />
            </View>
            <Text variant="body" className="ml-2 text-gray-600 dark:text-gray-400">
              Secure & encrypted
            </Text>
          </View>

          <View className="flex-row items-center px-3 py-2">
            <View className="w-6 h-6 items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Ionicons name="swap-horizontal" size={14} color={isDark ? '#60a5fa' : '#3b82f6'} />
            </View>
            <Text variant="body" className="ml-2 text-gray-600 dark:text-gray-400">
              Auto-convert to USD
            </Text>
          </View>

          <View className="flex-row items-center px-3 py-2">
            <View className="w-6 h-6 items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Ionicons name="flash" size={14} color={isDark ? '#60a5fa' : '#3b82f6'} />
            </View>
            <Text variant="body" className="ml-2 text-gray-600 dark:text-gray-400">
              Fast processing
            </Text>
          </View>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeIn.delay(1000).duration(500)}
        className="p-5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
      >
        <Button onPress={handleReceiveMoney} variant="primary">
          Receive Money
        </Button>
      </Animated.View>
    </View>
  );
}

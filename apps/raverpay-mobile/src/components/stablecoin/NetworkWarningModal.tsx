// src/components/stablecoin/NetworkWarningModal.tsx
import { Button, Text } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface NetworkWarningModalProps {
  visible: boolean;
  onClose: () => void;
  network: string;
  tokenType: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function NetworkWarningModal({
  visible,
  onClose,
  network,
  tokenType,
}: NetworkWarningModalProps) {
  const getWarningContent = () => {
    const isTestnet =
      network.includes('Sepolia') || network.includes('Goerli') || network.includes('Mumbai');

    return {
      title: isTestnet ? 'Testnet Warning' : 'Network Verification Required',
      message: isTestnet
        ? `You are using a testnet wallet (${network}). This wallet can only receive test tokens and is not suitable for real transactions. Please ensure you are using the correct network for your intended purpose.`
        : `Please double-check that you are sending ${tokenType} on the ${network} network. Sending tokens on a different network may result in permanent loss of funds.`,
      iconName: 'warning' as const,
      iconColor: isTestnet ? '#ef4444' : '#f59e0b',
      bgColor: isTestnet ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: isTestnet
        ? 'border-red-200 dark:border-red-800'
        : 'border-amber-200 dark:border-amber-800',
      textColor: isTestnet
        ? 'text-red-900 dark:text-red-200'
        : 'text-amber-900 dark:text-amber-200',
      descColor: isTestnet
        ? 'text-red-800 dark:text-red-300'
        : 'text-amber-800 dark:text-amber-300',
    };
  };

  const warning = getWarningContent();

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <AnimatedPressable
          entering={FadeIn.duration(200)}
          onPress={onClose}
          className="absolute inset-0 bg-black/50"
        />

        <Animated.View
          entering={SlideInDown.springify().damping(200)}
          className="bg-white dark:bg-gray-800 rounded-t-3xl"
        >
          <View className="px-6 pt-6 pb-2">
            <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full self-center mb-6" />

            <View className="flex-row items-start mb-4">
              <View
                className={`w-12 h-12 items-center justify-center ${warning.bgColor} ${warning.borderColor} border rounded-2xl`}
              >
                <Ionicons name={warning.iconName} size={24} color={warning.iconColor} />
              </View>

              <View className="ml-4 flex-1">
                <Text variant="h4" className="font-bold mb-2">
                  {warning.title}
                </Text>
                <Text variant="body" className="text-gray-600 dark:text-gray-400">
                  {warning.message}
                </Text>
              </View>
            </View>

            <View
              className={`p-4 mt-4 ${warning.bgColor} ${warning.borderColor} border rounded-2xl`}
            >
              <View className="flex-row items-start mb-3">
                <View className="w-6 h-6 items-center justify-center bg-white/50 dark:bg-black/20 rounded-full">
                  <Text variant="body" className={`font-bold ${warning.textColor}`}>
                    1
                  </Text>
                </View>
                <Text variant="body" className={`ml-3 flex-1 ${warning.descColor}`}>
                  Verify the network is <Text className="font-bold">{network}</Text>
                </Text>
              </View>

              <View className="flex-row items-start mb-3">
                <View className="w-6 h-6 items-center justify-center bg-white/50 dark:bg-black/20 rounded-full">
                  <Text variant="body" className={`font-bold ${warning.textColor}`}>
                    2
                  </Text>
                </View>
                <Text variant="body" className={`ml-3 flex-1 ${warning.descColor}`}>
                  Ensure you are sending <Text className="font-bold">{tokenType}</Text> only
                </Text>
              </View>

              <View className="flex-row items-start">
                <View className="w-6 h-6 items-center justify-center bg-white/50 dark:bg-black/20 rounded-full">
                  <Text variant="body" className={`font-bold ${warning.textColor}`}>
                    3
                  </Text>
                </View>
                <Text variant="body" className={`ml-3 flex-1 ${warning.descColor}`}>
                  Double-check the wallet address before sending
                </Text>
              </View>
            </View>
          </View>

          <View className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onPress={onClose} variant="primary">
              I Understand
            </Button>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

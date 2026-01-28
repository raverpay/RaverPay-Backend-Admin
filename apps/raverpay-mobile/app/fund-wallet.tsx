// app/fund-wallet.tsx
import {
  ActiveVirtualAccount,
  RequestVirtualAccount,
  VirtualAccountLoading,
} from '@/components/fund-wallet';
import { SentryErrorBoundary } from '@/src/components/SentryErrorBoundary';
import { Button, Card, Input, ScreenHeader, Text } from '@/src/components/ui';
import { config } from '@/src/constants/config';
import { useTheme } from '@/src/hooks/useTheme';
import { apiClient } from '@/src/lib/api/client';
import { API_ENDPOINTS } from '@/src/lib/api/endpoints';
import { formatCurrency } from '@/src/lib/utils/formatters';
import { toast } from '@/src/lib/utils/toast';
import { getMyVirtualAccount, requeryVirtualAccount } from '@/src/services/virtual-account.service';
import { useWalletStore } from '@/src/store/wallet.store';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

const API_BASE_URL = config.API_BASE_URL?.replace('/api', '') || '';

// Helper function to get quick amounts based on limit
const getQuickAmounts = (singleTransactionLimit: number): number[] => {
  if (singleTransactionLimit >= 100000) {
    return [10000, 50000, 100000]; // TIER_1+
  } else if (singleTransactionLimit >= 50000) {
    return [5000, 10000, 50000]; // TIER_0 high
  } else {
    return [1000, 5000, 10000]; // TIER_0 default
  }
};

type PaymentTab = 'card' | 'transfer';
type Currency = 'NGN' | 'USD' | 'EUR' | 'GBP';

interface FundCardResponse {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
}

export default function FundWalletScreen() {
  return (
    <SentryErrorBoundary>
      <FundWalletContent />
    </SentryErrorBoundary>
  );
}

function FundWalletContent() {
  const { isDark } = useTheme();
  const { balance, dailyRemaining, singleTransactionLimit, kycTier } = useWalletStore();
  const queryClient = useQueryClient();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('NGN');
  const [activeTab, setActiveTab] = useState<PaymentTab>('card');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  // Fetch virtual account
  const { data: virtualAccount, isPending: isLoadingVirtualAccount } = useQuery({
    queryKey: ['virtual-account'],
    queryFn: getMyVirtualAccount,
    enabled: activeTab === 'transfer',
  });

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleFundWithCard = async () => {
    const amountValue = parseFloat(amount);

    // Validation
    if (!amount || amountValue <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (amountValue < 100) {
      Alert.alert('Invalid Amount', 'Minimum funding amount is ₦100');
      return;
    }

    // Check single transaction limit
    const maxAmount = parseFloat(singleTransactionLimit.toString());
    if (amountValue > maxAmount) {
      Alert.alert(
        'Amount Exceeds Limit',
        `Maximum funding amount for your account (${kycTier}) is ${formatCurrency(maxAmount)}.\n\nUpgrade your KYC tier to increase limits.`,
      );
      return;
    }

    // Check daily remaining limit
    const dailyRemainingValue = parseFloat(dailyRemaining.toString());
    if (amountValue > dailyRemainingValue) {
      Alert.alert(
        'Daily Limit Exceeded',
        `You have ${formatCurrency(dailyRemainingValue)} remaining in your daily limit.\n\nTry again tomorrow or upgrade your KYC tier.`,
      );
      return;
    }

    setIsLoading(true);
    try {
      // PRODUCTION: Uncomment this when app is installed on device
      // const callbackUrl = "raverpay://funding/callback";

      // DEVELOPMENT: Use ngrok URL for Expo Go testing
      const callbackUrl = `${API_BASE_URL}/api/payments/funding/callback`;

      const response = await apiClient.post<FundCardResponse>(
        API_ENDPOINTS.TRANSACTIONS.FUND_CARD,
        {
          amount: amountValue,
          callbackUrl,
        },
      );

      setPaymentReference(response.data.reference);
      setAuthUrl(response.data.authorizationUrl);
      setShowWebView(true);
    } catch (error: any) {
      Alert.alert(
        'Payment Error',
        error?.response?.data?.message || 'Failed to initialize payment',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebViewNavigationChange = (navState: any) => {
    const { url } = navState;

    // Detect callback URL (works for both ngrok and deep link)
    if (url.includes('funding/callback')) {
      // Extract reference from URL
      const urlObj = new URL(url);
      const reference =
        urlObj.searchParams.get('reference') ||
        urlObj.searchParams.get('trxref') || // Paystack uses 'trxref'
        paymentReference;

      if (reference) {
        handleVerifyPayment(reference);
      }
    }
  };

  const handleVerifyPayment = async (reference: string) => {
    setShowWebView(false);
    setIsVerifying(true);

    try {
      const response = await apiClient.get(API_ENDPOINTS.TRANSACTIONS.VERIFY(reference));

      // Invalidate wallet and transaction queries
      await queryClient.invalidateQueries({ queryKey: ['wallet'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });

      Alert.alert(
        'Payment Successful!',
        `Your wallet has been funded with ${formatCurrency(parseFloat(response.data.amount))}`,
        [
          {
            text: 'Done',
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        'Verification Failed',
        error?.response?.data?.message ||
          'Failed to verify payment. Please contact support if money was deducted.',
      );
    } finally {
      setIsVerifying(false);
      setAmount('');
      setPaymentReference('');
      setAuthUrl('');
    }
  };

  const handleCopyAccountNumber = async () => {
    if (virtualAccount) {
      await Clipboard.setString(virtualAccount.accountNumber);
      toast.success({
        title: 'Copied!',
        message: 'Account number copied to clipboard',
      });
    }
  };

  const handleShareAccount = async () => {
    if (virtualAccount) {
      try {
        await Share.share({
          message: `My Raverpay Account Details:\n\nBank: ${virtualAccount.bankName}\nAccount Number: ${virtualAccount.accountNumber}\nAccount Name: ${virtualAccount.accountName}`,
        });
      } catch {
        // User cancelled share
      }
    }
  };

  const handleRequeryAccount = async () => {
    try {
      await requeryVirtualAccount();
      toast.success({
        title: 'Checking...',
        message: 'Checking for pending transactions',
      });
      // Refetch wallet to show updated balance
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
      }, 3000);
    } catch (error: any) {
      toast.error({
        title: 'Failed',
        message: error.response?.data?.message || 'Failed to check for transactions',
      });
    }
  };

  const handleRequestVirtualAccount = () => {
    router.push('/virtual-account/consent');
  };

  const handleSelectStablecoin = (tokenType?: 'USDT' | 'USDC') => {
    router.push({
      pathname: '/stablecoin/select-token',
      params: tokenType ? { preselectedToken: tokenType } : undefined,
    });
  };

  const handleCancelPayment = async () => {
    Alert.alert('Cancel Payment', 'Are you sure you want to cancel this payment?', [
      {
        text: 'No',
        style: 'cancel',
      },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          if (paymentReference) {
            try {
              await apiClient.post(API_ENDPOINTS.TRANSACTIONS.CANCEL(paymentReference));
            } catch (error) {
              // Silently fail - transaction will be cancelled or verified later
              console.log('Failed to cancel transaction:', error);
            }
          }
          setShowWebView(false);
          setAuthUrl('');
          setPaymentReference('');
        },
      },
    ]);
  };

  // Show WebView for payment
  if (showWebView && authUrl) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-800">
        <StatusBar style={isDark ? 'light' : 'dark'} />

        {/* Header */}
        <ScreenHeader
          title="Complete Payment"
          backIcon="close"
          onBack={handleCancelPayment}
          disabled={isVerifying}
          withPadding={true}
        />

        <WebView
          source={{ uri: authUrl }}
          onNavigationStateChange={handleWebViewNavigationChange}
          startInLoadingState={true}
          renderLoading={() => (
            <View className="flex-1 items-center justify-center bg-white dark:bg-gray-800">
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text variant="body" color="secondary" className="mt-4">
                Loading payment page...
              </Text>
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50 dark:bg-gray-900"
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <ScreenHeader title="Fund Wallet" disabled={isLoading || isVerifying} subtitle={balance} />

      <ScrollView
        className="flex-1 px-5 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 200 }}
      >
        {/* Currency Selector */}
        <Card variant="elevated" className="p-4 mb-6">
          <Text variant="bodyMedium" className="mb-3 font-semibold">
            Select Currency
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setSelectedCurrency('NGN')}
              className={`flex-1 py-3 px-4 rounded-2xl border-2 ${
                selectedCurrency === 'NGN'
                  ? 'bg-purple-100 dark:bg-purple-900/30 border-[#5B55F6]'
                  : 'bg-white dark:bg-gray-800 border-gray-800 dark:border-gray-600'
              }`}
            >
              <Text
                variant="body"
                align="center"
                className={
                  selectedCurrency === 'NGN'
                    ? 'text-[#5B55F6] font-semibold'
                    : 'text-gray-600 dark:text-gray-400'
                }
              >
                ₦ Naira
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedCurrency('USD')}
              className={`flex-1 py-3 px-4 rounded-2xl border-2 ${
                selectedCurrency === 'USD'
                  ? 'bg-purple-100 dark:bg-purple-900/30 border-[#5B55F6]'
                  : 'bg-white dark:bg-gray-800 border-gray-800 dark:border-gray-600'
              }`}
            >
              <Text
                variant="body"
                align="center"
                className={
                  selectedCurrency === 'USD'
                    ? 'text-[#5B55F6] font-semibold'
                    : 'text-gray-600 dark:text-gray-400'
                }
              >
                $ USD
              </Text>
            </TouchableOpacity>
            {/* 
            <TouchableOpacity
              onPress={() => Alert.alert('Coming Soon', 'EUR funding will be available soon')}
              className="flex-1 py-3 px-4 rounded-lg border-2 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-50"
              disabled
            >
              <Text variant="body" align="center" className="text-gray-400 dark:text-gray-500">
                € EUR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert('Coming Soon', 'GBP funding will be available soon')}
              className="flex-1 py-3 px-4 rounded-lg border-2 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-50"
              disabled
            >
              <Text variant="body" align="center" className="text-gray-400 dark:text-gray-500">
                £ GBP
              </Text>
            </TouchableOpacity> */}
          </View>
        </Card>

        {/* USD Flow - Show Stablecoin Options */}
        {selectedCurrency === 'USD' && (
          <>
            <Card variant="elevated" className="p-5 mb-4">
              <View className="flex-row items-start mb-4">
                <Ionicons name="information-circle" size={24} color="#3B82F6" />
                <Text variant="body" className="ml-3 flex-1 text-gray-600 dark:text-gray-400">
                  Receive USD via stablecoins (USDT/USDC). Your stablecoin will be automatically
                  converted to USD.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleSelectStablecoin('USDT')}
                className="flex-row items-center justify-between py-4 px-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
              >
                <View className="flex-row items-center">
                  <Ionicons name="wallet" size={24} color="#22c55e" />
                  <View className="ml-3">
                    <Text variant="bodyMedium" className="font-semibold">
                      Receive USDT
                    </Text>
                    <Text variant="caption" className="text-gray-600 dark:text-gray-400">
                      Ethereum, Polygon, BSC, Arbitrum
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSelectStablecoin('USDC')}
                className="flex-row items-center justify-between py-4 px-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mt-3"
              >
                <View className="flex-row items-center">
                  <Ionicons name="wallet" size={24} color="#3b82f6" />
                  <View className="ml-3">
                    <Text variant="bodyMedium" className="font-semibold">
                      Receive USDC
                    </Text>
                    <Text variant="caption" className="text-gray-600 dark:text-gray-400">
                      Ethereum, Polygon, Arbitrum
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </Card>
          </>
        )}

        {/* NGN Flow - Existing Tabs */}
        {selectedCurrency === 'NGN' && (
          <>
            {/* Tabs */}
            <View className="flex-row mb-6 bg-gray-200 dark:bg-gray-700 rounded-xl p-1">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg ${activeTab === 'card' ? 'bg-white dark:bg-gray-800' : ''}`}
                onPress={() => setActiveTab('card')}
              >
                <Text
                  variant="bodyMedium"
                  align="center"
                  className={
                    activeTab === 'card'
                      ? 'text-[#5B55F6] dark:text-[#5B55F6]'
                      : 'text-gray-600 dark:text-gray-400'
                  }
                >
                  Pay with Card
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg ${activeTab === 'transfer' ? 'bg-white dark:bg-gray-800' : ''}`}
                onPress={() => setActiveTab('transfer')}
              >
                <Text
                  variant="bodyMedium"
                  align="center"
                  className={
                    activeTab === 'transfer'
                      ? 'text-[#5B55F6] dark:text-[#5B55F6]'
                      : 'text-gray-600 dark:text-gray-400'
                  }
                >
                  Bank Transfer
                </Text>
              </TouchableOpacity>
            </View>

            {/* Card Tab Content */}
            {activeTab === 'card' && (
              <>
                {/* Amount Input */}
                <Card variant="elevated" className="p-5 mb-4">
                  <Text variant="h5" className="mb-4">
                    Enter Amount
                  </Text>

                  <Input
                    placeholder="0.00"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                  />

                  {/* Quick Amounts */}
                  <View className="flex-row justify-between mt-4 gap-2">
                    {getQuickAmounts(parseFloat(singleTransactionLimit.toString())).map((value) => (
                      <TouchableOpacity
                        key={value}
                        onPress={() => handleQuickAmount(value)}
                        className="flex-1 min-w-[30%]"
                      >
                        <Card
                          variant={amount === value.toString() ? 'filled' : 'elevated'}
                          className={`p-3 items-center ${
                            amount === value.toString()
                              ? 'bg-purple-100 border-2 border-[#5B55F6]'
                              : ''
                          }`}
                        >
                          <Text variant="caption" weight="semibold">
                            {formatCurrency(value)}
                          </Text>
                        </Card>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Card>

                {/* Limit Info */}
                <Card variant="elevated" className="p-4 mb-4 bg-purple-50">
                  <View className="flex-row items-start">
                    <Ionicons name="shield-checkmark-outline" size={20} color="#5B55F6" />
                    <View className="ml-3 flex-1">
                      <Text variant="bodyMedium" className="text-purple-800 mb-1">
                        Your Limits ({kycTier})
                      </Text>
                      <Text variant="caption" className="text-purple-700">
                        Max per transaction:{' '}
                        {formatCurrency(parseFloat(singleTransactionLimit.toString()))}
                      </Text>
                      <Text variant="caption" className="text-purple-700">
                        Daily remaining: {formatCurrency(parseFloat(dailyRemaining.toString()))}
                      </Text>
                    </View>
                  </View>
                </Card>

                {/* Fund Button */}
                <Button
                  variant="primary"
                  onPress={handleFundWithCard}
                  loading={isLoading}
                  disabled={isLoading || isVerifying || !amount}
                >
                  Fund Wallet
                </Button>
              </>
            )}

            {/* Bank Transfer Tab Content */}
            {activeTab === 'transfer' && (
              <>
                {isLoadingVirtualAccount ? (
                  <VirtualAccountLoading />
                ) : virtualAccount && virtualAccount.isActive ? (
                  <ActiveVirtualAccount
                    virtualAccount={virtualAccount}
                    onCopyAccountNumber={handleCopyAccountNumber}
                    onShareAccount={handleShareAccount}
                    onRequeryAccount={handleRequeryAccount}
                  />
                ) : (
                  <RequestVirtualAccount onRequestAccount={handleRequestVirtualAccount} />
                )}
              </>
            )}
          </>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* Payment Verification Overlay */}
      {isVerifying && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-8 mx-8 items-center">
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text variant="h3" className="mt-6 mb-2">
              Verifying Payment
            </Text>
            <Text variant="body" color="secondary" align="center">
              Please wait while we confirm your transaction...
            </Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

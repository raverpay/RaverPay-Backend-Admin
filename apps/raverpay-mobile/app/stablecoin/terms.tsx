// app/stablecoin/terms.tsx
import { Button, ScreenHeader, Text } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';

interface TermsSection {
  id: string;
  title: string;
  summary: string;
  fullText: string;
}

const TERMS_SECTIONS: TermsSection[] = [
  {
    id: 'acceptable-use',
    title: 'Acceptable Use Policy',
    summary:
      'Raverpay stablecoin address available to verified Raverpay account holders allows users to receive approved stablecoins that are automatically converted to USD in their Raverpay USD Wallet.',
    fullText: `Raverpay stablecoin addresses are exclusively available to verified Raverpay account holders.\n\nBy using this service, you agree to:\n• Only receive approved stablecoins (USDT, USDC) on the specified networks\n• Provide accurate KYC information\n• Comply with all applicable laws and regulations\n• Not use the service for illegal activities, money laundering, or terrorist financing\n\nRaverpay reserves the right to suspend or terminate your stablecoin address at any time and report suspicious activity to relevant authorities.`,
  },
  {
    id: 'automatic-conversion',
    title: 'Automatic Conversion to USD',
    summary:
      'All stablecoins received through your Stablecoin Address will be automatically and irrevocably converted to USD at the prevailing exchange rate at the time of conversion.',
    fullText: `All stablecoins (USDT, USDC) received to your Raverpay stablecoin address will be automatically converted to USD.\n\nKey Points:\n• Conversion is AUTOMATIC and IRREVOCABLE\n• Exchange rate is determined at the time of conversion\n• Conversion may include a markup fee set by Raverpay\n• Converted USD will appear in your Raverpay USD Wallet\n• Conversion typically occurs within 24-48 hours\n\nYou acknowledge that you accept the exchange rate risk and cannot reverse the conversion once initiated.`,
  },
  {
    id: 'disclaimer',
    title: 'Disclaimer',
    summary:
      'Raverpay is not a bank or regulated exchange. All services are provided "as is" and "as available," without any warranties, express or implied.',
    fullText: `NOT A BANK OR EXCHANGE\nRaverpay is not a bank, financial institution, or regulated cryptocurrency exchange.\n\nNO WARRANTIES\nServices are provided "AS IS" and "AS AVAILABLE" without warranties of any kind.\n\nLIMITATION OF LIABILITY\nRaverpay shall not be liable for lost profits, direct or indirect damages, or loss of funds due to user error (wrong network, wrong address).\n\nWRONG NETWORK DEPOSITS\nIf you send tokens on the wrong network or send unsupported tokens, Raverpay is NOT liable for any resulting loss.`,
  },
];

export default function TermsScreen() {
  const { isDark } = useTheme();
  const params = useLocalSearchParams();
  //   const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  //   const [checkedSections, setCheckedSections] = useState<Set<string>>(new Set());
  const [finalAgreed, setFinalAgreed] = useState(false);

  //   const toggleSection = (sectionId: string) => {
  //     const newExpanded = new Set(expandedSections);
  //     if (newExpanded.has(sectionId)) {
  //       newExpanded.delete(sectionId);
  //     } else {
  //       newExpanded.add(sectionId);
  //     }
  //     setExpandedSections(newExpanded);
  //   };

  //   const toggleCheckbox = (sectionId: string) => {
  //     const newChecked = new Set(checkedSections);
  //     if (newChecked.has(sectionId)) {
  //       newChecked.delete(sectionId);
  //     } else {
  //       newChecked.add(sectionId);
  //     }
  //     setCheckedSections(newChecked);
  //   };

  const canContinue = finalAgreed;

  const handleContinue = () => {
    if (!canContinue) {
      Alert.alert('Agreement Required', 'Please read and agree to all terms before continuing');
      return;
    }

    router.push({
      pathname: '/stablecoin/creating',
      params,
    });
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader title="Terms & Conditions" />

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        <Text variant="bodyMedium" className="mb-5">
          Please read and accept the following terms and conditions to proceed with creating your
          stablecoin wallet.
        </Text>

        {TERMS_SECTIONS.map((section) => {
          //   const isExpanded = expandedSections.has(section.id);
          //   const isChecked = checkedSections.has(section.id);

          return (
            <View
              key={section.id}
              className="p-4 mb-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <Text variant="body" className="font-semibold mb-2">
                {section.title}
              </Text>

              <Text variant="body" className="text-gray-600 dark:text-gray-400 mb-3">
                {section.summary}
              </Text>

              {/* <TouchableOpacity
                onPress={() => toggleSection(section.id)}
                className="flex-row items-center mb-3"
              >
                <Text variant="body" className="text-blue-600 dark:text-blue-400 font-semibold">
                  {isExpanded ? 'Read less' : 'Continue reading'}
                </Text>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={isDark ? '#60a5fa' : '#3b82f6'}
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity> */}
              {/* 
              {isExpanded && (
                <View className="p-3 mb-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Text variant="body" className="text-gray-600 dark:text-gray-400">
                    {section.fullText}
                  </Text>
                </View>
              )} */}

              {/* <TouchableOpacity
                onPress={() => toggleCheckbox(section.id)}
                className="flex-row items-center"
              >
                <View
                  className={`w-5 h-5 rounded border-2 items-center justify-center ${
                    isChecked
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-transparent border-gray-400 dark:border-gray-500'
                  }`}
                >
                  {isChecked && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text variant="body" className="ml-2 flex-1">
                  I have read and agree to the {section.title}
                </Text>
              </TouchableOpacity> */}
            </View>
          );
        })}

        <TouchableOpacity
          onPress={() => setFinalAgreed(!finalAgreed)}
          className={`flex-row items-center p-4 mb-6 rounded-xl border-2 ${
            finalAgreed
              ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
          }`}
        >
          <View
            className={`w-5 h-5 rounded border-2 items-center justify-center ${
              finalAgreed
                ? 'bg-blue-500 border-blue-500'
                : 'bg-transparent border-gray-400 dark:border-gray-500'
            }`}
          >
            {finalAgreed && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text variant="bodyMedium" className="ml-2 flex-1 font-semibold">
            I agree to all terms and conditions
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View className="p-5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <Button onPress={handleContinue} disabled={!canContinue} variant="primary">
          Accept & Continue
        </Button>
      </View>
    </View>
  );
}

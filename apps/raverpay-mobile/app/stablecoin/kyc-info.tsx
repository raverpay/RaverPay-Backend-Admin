// app/stablecoin/kyc-info.tsx
import { Button, ScreenHeader, Text } from '@/src/components/ui';
import { useTheme } from '@/src/hooks/useTheme';
import { toast } from '@/src/lib/utils/toast';
import { MonthlyIncomeRange } from '@/src/types/stablecoin.types';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View } from 'react-native';

const INCOME_RANGES: MonthlyIncomeRange[] = [
  'Under ₦100,000',
  '₦100,000 - ₦500,000',
  '₦500,000 - ₦2,000,000',
  '₦2,000,000 - ₦5,000,000',
  'Above ₦5,000,000',
];

interface DocumentFile {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
}

export default function KYCInfoScreen() {
  const { isDark } = useTheme();
  const params = useLocalSearchParams<{
    tokenType: string;
    blockchain: string;
    network: string;
    networkLabel: string;
  }>();
  const [selectedIncome, setSelectedIncome] = useState<MonthlyIncomeRange | null>(null);
  const [document, setDocument] = useState<DocumentFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      if (file.size && file.size > 10 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please select a file smaller than 10MB');
        return;
      }

      setDocument({
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType || 'application/pdf',
        size: file.size || 0,
      });

      toast.success({ title: 'Success', message: 'Document selected' });
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to select document');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleContinue = () => {
    if (!selectedIncome) {
      Alert.alert('Income Required', 'Please select your monthly income range');
      return;
    }

    if (!document) {
      Alert.alert('Bank Statement Required', 'Please upload your bank statement');
      return;
    }

    router.push({
      pathname: '/stablecoin/terms',
      params: {
        ...params,
        monthlyIncomeRange: selectedIncome,
        documentUri: document.uri,
        documentName: document.name,
        documentMimeType: document.mimeType,
      },
    });
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader title="Account Information" />

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        {/* Network Info */}
        <View className="p-4 mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center">
            <Ionicons name="information-circle" size={20} color={isDark ? '#60a5fa' : '#3b82f6'} />
            <View className="ml-2 flex-1">
              <Text variant="body" className="text-gray-600 dark:text-gray-400 mb-1">
                Creating wallet for:
              </Text>
              <Text variant="bodyMedium" className="font-semibold">
                {params.networkLabel}
              </Text>
            </View>
          </View>
        </View>

        {/* Monthly Income */}
        <View className="mb-6">
          <Text variant="bodyMedium" className="mb-2 font-semibold">
            Monthly Income Range
          </Text>
          <Text variant="body" className="mb-3 text-gray-600 dark:text-gray-400">
            This information helps us comply with financial regulations
          </Text>
          <View className="gap-2">
            {INCOME_RANGES.map((range, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedIncome(range)}
                className={`flex-row items-center justify-between py-4 px-4 rounded-xl border-2 ${
                  selectedIncome === range
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                }`}
              >
                <Text
                  variant="bodyMedium"
                  className={
                    selectedIncome === range
                      ? 'text-blue-700 dark:text-blue-400'
                      : 'text-gray-900 dark:text-gray-100'
                  }
                >
                  {range}
                </Text>
                {selectedIncome === range && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={isDark ? '#60a5fa' : '#3b82f6'}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bank Statement Upload */}
        <View className="mb-6">
          <Text variant="bodyMedium" className="mb-2 font-semibold">
            Bank Statement
          </Text>
          <Text variant="body" className="mb-3 text-gray-600 dark:text-gray-400">
            Upload a recent bank statement (PDF or image, max 10MB)
          </Text>

          {!document ? (
            <TouchableOpacity
              onPress={handlePickDocument}
              disabled={isUploading}
              className="h-40 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl items-center justify-center"
            >
              {isUploading ? (
                <ActivityIndicator />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={32}
                    color={isDark ? '#9ca3af' : '#6b7280'}
                  />
                  <Text variant="bodyMedium" className="mt-2 text-gray-600 dark:text-gray-400">
                    Tap to upload
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl">
              {isImage(document.mimeType) ? (
                <Image
                  source={{ uri: document.uri }}
                  className="w-15 h-15 rounded-lg"
                  contentFit="cover"
                />
              ) : (
                <View className="w-15 h-15 items-center justify-center">
                  <Ionicons name="document-text" size={48} color={isDark ? '#9ca3af' : '#6b7280'} />
                </View>
              )}
              <View className="ml-3 flex-1">
                <Text variant="bodyMedium" className="font-semibold" numberOfLines={1}>
                  {document.name}
                </Text>
                <Text variant="body" className="mt-1 text-gray-600 dark:text-gray-400">
                  {formatFileSize(document.size)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setDocument(null)} className="p-1">
                <Ionicons name="close-circle" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Privacy Note */}
        <View className="p-4 mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <View className="flex-row items-start">
            <Ionicons name="shield-checkmark" size={20} color="#22c55e" />
            <Text variant="body" className="ml-2 flex-1 text-gray-600 dark:text-gray-400">
              Your information is encrypted and stored securely. We only use it for KYC compliance.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="p-5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <Button
          onPress={handleContinue}
          disabled={!selectedIncome || !document || isUploading}
          variant="primary"
        >
          Continue
        </Button>
      </View>
    </View>
  );
}

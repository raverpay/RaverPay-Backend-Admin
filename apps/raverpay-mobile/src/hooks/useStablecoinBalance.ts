import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stablecoinService } from '@/src/services/stablecoin.service';
import {
  StablecoinWallet,
  TokenBalance,
  StablecoinBalanceSummary,
} from '@/src/types/stablecoin.types';

interface UseStablecoinBalanceResult {
  balances: TokenBalance[];
  totalUSD: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all stablecoin wallet balances for the current user
 *
 * Fetches all user's stablecoin wallets, then fetches the balance for each one
 * Returns aggregated balance information with total USD value
 */
export const useStablecoinBalance = (): UseStablecoinBalanceResult => {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [totalUSD, setTotalUSD] = useState(0);
  const [isRefetching, setIsRefetching] = useState(false);

  // Fetch balances function
  const fetchBalances = useCallback(async () => {
    try {
      // 1. Get all user's stablecoin wallets
      const walletsResponse = await stablecoinService.getStablecoinWalletsList();

      if (!walletsResponse.success || !walletsResponse.data) {
        throw new Error('Failed to fetch stablecoin wallets');
      }

      const wallets: StablecoinWallet[] = walletsResponse.data;

      if (wallets.length === 0) {
        setBalances([]);
        setTotalUSD(0);
        return { balances: [], totalUSD: 0 };
      }

      // 2. Fetch balance for each wallet
      const balancePromises = wallets.map(async (wallet) => {
        try {
          const balanceResponse = await stablecoinService.getTokenBalance({
            address: wallet.address,
            tokenType: wallet.tokenType,
            blockchain: wallet.blockchain,
            network: wallet.network,
          });

          if (balanceResponse.success && balanceResponse.data) {
            return {
              tokenType: wallet.tokenType,
              blockchain: wallet.blockchain,
              network: wallet.network,
              balance: balanceResponse.data.balance,
              balanceUSD: balanceResponse.data.balanceUSD,
              decimals: balanceResponse.data.decimals,
              tokenAddress: balanceResponse.data.tokenAddress,
            } as TokenBalance;
          }

          // If balance fetch fails, return 0 balance
          return {
            tokenType: wallet.tokenType,
            blockchain: wallet.blockchain,
            network: wallet.network,
            balance: '0',
            balanceUSD: 0,
            decimals: 6,
            tokenAddress: '',
          } as TokenBalance;
        } catch (error) {
          console.error(
            `Error fetching balance for ${wallet.tokenType} on ${wallet.blockchain}:`,
            error,
          );
          // Return 0 balance on error
          return {
            tokenType: wallet.tokenType,
            blockchain: wallet.blockchain,
            network: wallet.network,
            balance: '0',
            balanceUSD: 0,
            decimals: 6,
            tokenAddress: '',
          } as TokenBalance;
        }
      });

      const fetchedBalances = await Promise.all(balancePromises);

      // 3. Calculate total USD
      const total = fetchedBalances.reduce(
        (sum: number, balance: TokenBalance) => sum + balance.balanceUSD,
        0,
      );

      setBalances(fetchedBalances);
      setTotalUSD(total);

      return {
        balances: fetchedBalances,
        totalUSD: total,
      };
    } catch (error) {
      console.error('Error fetching stablecoin balances:', error);
      throw error;
    }
  }, []);

  // Use React Query for automatic caching and refetching
  const {
    isLoading,
    error,
    refetch: queryRefetch,
  } = useQuery({
    queryKey: ['stablecoin-balances'],
    queryFn: fetchBalances,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  // Manual refetch function
  const refetch = useCallback(async () => {
    setIsRefetching(true);
    try {
      await queryRefetch();
    } finally {
      setIsRefetching(false);
    }
  }, [queryRefetch]);

  return {
    balances,
    totalUSD,
    isLoading: isLoading || isRefetching,
    error: error as Error | null,
    refetch,
  };
};

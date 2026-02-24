import { useQuery } from '@tanstack/react-query';
import { getAssetsByOwner, getTransactionHistory, getSolBalance, parseTokenBalances, parseNFTs } from '@/lib/helius';
import { useAppStore } from '@/stores/appStore';
import { miniChartData } from '@/data/mockData';

// Hook to get portfolio data — real Helius data via edge function
export function usePortfolio(walletAddress: string | null) {
  const { getPortfolioCache, setPortfolioCache, setLastRefresh } = useAppStore();

  return useQuery({
    queryKey: ['portfolio', walletAddress],
    queryFn: async () => {
      if (!walletAddress) throw new Error('No wallet');

      // Check cache
      const cached = getPortfolioCache(walletAddress);
      if (cached) return cached;

      const [assets, solBalance] = await Promise.all([
        getAssetsByOwner(walletAddress),
        getSolBalance(walletAddress),
      ]);

      const tokenBalances = parseTokenBalances(assets);
      const totalTokenValue = tokenBalances.reduce((sum, t) => sum + (t.usdValue || 0), 0);
      const nftAssets = parseNFTs(assets);
      const solUsdValue = solBalance * (assets.nativeBalance?.price_per_sol || 0);

      const result = {
        totalValue: solUsdValue + totalTokenValue,
        change24h: 0,
        changePercent24h: 0,
        solBalance,
        tokens: tokenBalances,
        nftCount: nftAssets.length,
        stakedSol: 0,
        tokenCount: tokenBalances.length,
        chartData: miniChartData,
      };

      setPortfolioCache(walletAddress, result);
      setLastRefresh(walletAddress);
      return result;
    },
    enabled: !!walletAddress,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// Hook to get transactions
export function useTransactions(walletAddress: string | null) {
  return useQuery({
    queryKey: ['transactions', walletAddress],
    queryFn: async () => {
      if (!walletAddress) throw new Error('No wallet');
      return getTransactionHistory(walletAddress, 50);
    },
    enabled: !!walletAddress,
    staleTime: 2 * 60 * 1000,
  });
}

// Hook to get NFTs
export function useNFTs(walletAddress: string | null) {
  return useQuery({
    queryKey: ['nfts', walletAddress],
    queryFn: async () => {
      if (!walletAddress) throw new Error('No wallet');
      const assets = await getAssetsByOwner(walletAddress);
      return parseNFTs(assets);
    },
    enabled: !!walletAddress,
    staleTime: 5 * 60 * 1000,
  });
}

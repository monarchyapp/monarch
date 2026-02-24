import { useQueries } from '@tanstack/react-query';
import { getAssetsByOwner, getSolBalance, parseTokenBalances, parseNFTs } from '@/lib/helius';
import { useAppStore } from '@/stores/appStore';
import { miniChartData } from '@/data/mockData';

// Aggregates portfolio data across multiple wallets
export function useMultiPortfolio(wallets: string[]) {
  const { getPortfolioCache, setPortfolioCache, setLastRefresh } = useAppStore();

  const queries = useQueries({
    queries: wallets.map((wallet) => ({
      queryKey: ['portfolio', wallet],
      queryFn: async () => {
        const cached = getPortfolioCache(wallet);
        if (cached) return cached;

        const [assets, solBalance] = await Promise.all([
          getAssetsByOwner(wallet),
          getSolBalance(wallet),
        ]);

        const tokenBalances = parseTokenBalances(assets);
        const totalTokenValue = tokenBalances.reduce((sum, t) => sum + (t.usdValue || 0), 0);
        const nftAssets = parseNFTs(assets);
        const solUsdValue = solBalance * (assets.nativeBalance?.price_per_sol || 0);

        const result = {
          wallet,
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

        setPortfolioCache(wallet, result);
        setLastRefresh(wallet);
        return result;
      },
      enabled: !!wallet,
      staleTime: 5 * 60 * 1000,
      retry: 2,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isFetching = queries.some((q) => q.isFetching);
  const isError = queries.some((q) => q.isError);
  const portfolios = queries.map((q) => q.data).filter(Boolean);

  // Aggregate
  const aggregated = portfolios.length > 0 ? {
    totalValue: portfolios.reduce((s, p) => s + (p?.totalValue || 0), 0),
    solBalance: portfolios.reduce((s, p) => s + (p?.solBalance || 0), 0),
    tokens: aggregateTokens(portfolios),
    nftCount: portfolios.reduce((s, p) => s + (p?.nftCount || 0), 0),
    tokenCount: 0,
    chartData: miniChartData,
    walletCount: portfolios.length,
    perWallet: portfolios,
  } : null;

  if (aggregated) {
    aggregated.tokenCount = aggregated.tokens.length;
  }

  const refetch = () => queries.forEach((q) => q.refetch());

  return { data: aggregated, isLoading, isFetching, isError, refetch };
}

// Merge tokens across wallets by mint address
function aggregateTokens(portfolios: any[]) {
  const tokenMap = new Map<string, any>();

  for (const p of portfolios) {
    for (const t of (p?.tokens || [])) {
      const existing = tokenMap.get(t.mint);
      if (existing) {
        existing.balance += t.balance;
        existing.usdValue = (existing.usdValue || 0) + (t.usdValue || 0);
      } else {
        tokenMap.set(t.mint, { ...t });
      }
    }
  }

  return Array.from(tokenMap.values()).sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0));
}

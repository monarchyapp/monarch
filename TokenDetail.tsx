// Helius API client via edge function proxy
// All methods call the backend edge function which holds the API key securely

import { supabase } from '@/integrations/supabase/client';

export function isHeliusConfigured(): boolean {
  // Always true now — the edge function has the key
  return true;
}

export interface TokenBalance {
  mint: string;
  symbol: string;
  name: string;
  logoURI?: string;
  balance: number;
  decimals: number;
  usdValue?: number;
  pricePerToken?: number;
  verified?: boolean;
}

export interface NFTAsset {
  id: string;
  name: string;
  image: string;
  collection: string;
  attributes?: { trait_type: string; value: string }[];
  mint: string;
  lastActivity?: string;
}

export interface ParsedTransaction {
  signature: string;
  timestamp: number;
  type: string;
  description: string;
  fee: number;
  feePayer: string;
  nativeTransfers: { fromUserAccount: string; toUserAccount: string; amount: number }[];
  tokenTransfers: { fromUserAccount: string; toUserAccount: string; mint: string; tokenAmount: number; tokenStandard: string }[];
  source: string;
  status: string;
}

async function callHeliusProxy(action: string, walletAddress: string, limit?: number) {
  const { data, error } = await supabase.functions.invoke('helius-proxy', {
    body: { action, walletAddress, limit },
  });
  if (error) throw new Error(error.message || 'Edge function error');
  return data;
}

// DAS API: Get all assets (tokens + NFTs) for a wallet
export async function getAssetsByOwner(walletAddress: string): Promise<any> {
  return callHeliusProxy('getAssetsByOwner', walletAddress);
}

// Get parsed transaction history
export async function getTransactionHistory(walletAddress: string, limit = 50): Promise<ParsedTransaction[]> {
  return callHeliusProxy('getTransactions', walletAddress, limit);
}

// Get SOL balance
export async function getSolBalance(walletAddress: string): Promise<number> {
  const data = await callHeliusProxy('getBalance', walletAddress);
  return data.balance;
}

// Parse raw assets into typed token balances
export function parseTokenBalances(assets: any): TokenBalance[] {
  if (!assets?.items) return [];
  
  return assets.items
    .filter((item: any) => item.interface === 'FungibleToken' || item.interface === 'FungibleAsset')
    .map((item: any) => ({
      mint: item.id,
      symbol: item.content?.metadata?.symbol || 'Unknown',
      name: item.content?.metadata?.name || 'Unknown Token',
      logoURI: item.content?.links?.image || item.content?.files?.[0]?.uri,
      balance: item.token_info?.balance ? item.token_info.balance / Math.pow(10, item.token_info.decimals || 0) : 0,
      decimals: item.token_info?.decimals || 0,
      usdValue: item.token_info?.price_info?.total_price || 0,
      pricePerToken: item.token_info?.price_info?.price_per_token || 0,
      verified: item.content?.metadata?.token_standard === 'Fungible',
    }))
    .filter((t: TokenBalance) => t.balance > 0);
}

// Parse raw assets into NFTs
export function parseNFTs(assets: any): NFTAsset[] {
  if (!assets?.items) return [];
  
  return assets.items
    .filter((item: any) => item.interface === 'V1_NFT' || item.interface === 'ProgrammableNFT' || item.interface === 'V2_NFT')
    .map((item: any) => ({
      id: item.id,
      name: item.content?.metadata?.name || 'Unknown NFT',
      image: item.content?.links?.image || item.content?.files?.[0]?.uri || '',
      collection: item.grouping?.find((g: any) => g.group_key === 'collection')?.group_value || 'Unknown Collection',
      attributes: item.content?.metadata?.attributes || [],
      mint: item.id,
    }));
}

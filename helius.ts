// Mock data for Monarch Solana Portfolio App

export const portfolioData = {
  totalValue: 47832.61,
  change24h: 1247.33,
  changePercent24h: 2.68,
  solBalance: 312.47,
  solPrice: 142.36,
  stakedSol: 85.2,
  tokenCount: 14,
  nftCount: 8,
};

export const portfolioHistory = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  value: 40000 + Math.random() * 10000 + i * 200,
}));

export const miniChartData = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  value: 46000 + Math.sin(i / 3) * 1500 + Math.random() * 500,
}));

export interface Token {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
  change24h: number;
  allocation: number;
  avgBuyPrice: number;
  pnl: number;
  pnlPercent: number;
  color: string;
  icon: string;
}

export const tokens: Token[] = [
  { symbol: "SOL", name: "Solana", balance: 312.47, price: 142.36, value: 44488.75, change24h: 3.2, allocation: 93.0, avgBuyPrice: 98.50, pnl: 13706.22, pnlPercent: 44.55, color: "hsl(var(--chart-orange))", icon: "◎" },
  { symbol: "RAY", name: "Raydium", balance: 450, price: 2.84, value: 1278.00, change24h: -1.4, allocation: 2.7, avgBuyPrice: 3.10, pnl: -117.00, pnlPercent: -8.39, color: "hsl(var(--chart-blue))", icon: "⚡" },
  { symbol: "JUP", name: "Jupiter", balance: 1200, price: 0.89, value: 1068.00, change24h: 5.1, allocation: 2.2, avgBuyPrice: 0.72, pnl: 204.00, pnlPercent: 23.61, color: "hsl(var(--chart-green))", icon: "♃" },
  { symbol: "BONK", name: "Bonk", balance: 45000000, price: 0.0000082, value: 369.00, change24h: -3.8, allocation: 0.8, avgBuyPrice: 0.0000120, pnl: -171.00, pnlPercent: -31.67, color: "hsl(var(--chart-red))", icon: "🐕" },
  { symbol: "ORCA", name: "Orca", balance: 85, price: 3.42, value: 290.70, change24h: 1.2, allocation: 0.6, avgBuyPrice: 2.80, pnl: 52.70, pnlPercent: 22.14, color: "hsl(var(--chart-purple))", icon: "🐋" },
  { symbol: "MNDE", name: "Marinade", balance: 320, price: 0.098, value: 31.36, change24h: 0.5, allocation: 0.1, avgBuyPrice: 0.15, pnl: -16.64, pnlPercent: -34.67, color: "hsl(var(--chart-orange-light))", icon: "🧊" },
];

export interface Transaction {
  id: string;
  type: "send" | "receive" | "swap" | "stake" | "unstake" | "mint";
  token: string;
  amount: number;
  value: number;
  date: string;
  status: "confirmed" | "pending";
  gasFee: number;
  from: string;
  to: string;
  signature: string;
  contractAddress?: string;
}

export const transactions: Transaction[] = [
  { id: "1", type: "swap", token: "SOL → JUP", amount: 5.0, value: 711.80, date: "2026-02-24T14:32:00", status: "confirmed", gasFee: 0.000005, from: "8xK4...m9Pq", to: "JUP Program", signature: "4sGj...x9Km", contractAddress: "JUPy...swap" },
  { id: "2", type: "receive", token: "SOL", amount: 25.0, value: 3559.00, date: "2026-02-24T11:15:00", status: "confirmed", gasFee: 0.000005, from: "3nFp...k2Rw", to: "8xK4...m9Pq", signature: "2kLm...p7Hn" },
  { id: "3", type: "stake", token: "SOL", amount: 50.0, value: 7118.00, date: "2026-02-23T09:44:00", status: "confirmed", gasFee: 0.000005, from: "8xK4...m9Pq", to: "Stake Account", signature: "7pQr...n3Gf" },
  { id: "4", type: "send", token: "RAY", amount: 100.0, value: 284.00, date: "2026-02-22T16:20:00", status: "confirmed", gasFee: 0.000005, from: "8xK4...m9Pq", to: "5jRt...w8Kx", signature: "9mNk...f2Dp" },
  { id: "5", type: "swap", token: "BONK → SOL", amount: 10000000, value: 82.00, date: "2026-02-22T08:55:00", status: "confirmed", gasFee: 0.000005, from: "8xK4...m9Pq", to: "RAY Program", signature: "1xHj...k5Wm" },
  { id: "6", type: "mint", token: "Monarch #247", amount: 1, value: 2.5, date: "2026-02-21T20:10:00", status: "confirmed", gasFee: 0.000005, from: "Candy Machine", to: "8xK4...m9Pq", signature: "6gTp...m8Rn" },
  { id: "7", type: "receive", token: "ORCA", amount: 85.0, value: 290.70, date: "2026-02-20T12:30:00", status: "confirmed", gasFee: 0.000005, from: "7kWn...p4Hs", to: "8xK4...m9Pq", signature: "3fKm...w9Lp" },
  { id: "8", type: "swap", token: "USDC → SOL", amount: 500.0, value: 500.00, date: "2026-02-19T15:45:00", status: "pending", gasFee: 0.000005, from: "8xK4...m9Pq", to: "JUP Program", signature: "8nRp...j6Hk" },
];

export interface NFT {
  id: string;
  name: string;
  collection: string;
  image: string;
  floorPrice: number;
  lastSale: number;
  change: number;
  rarity: string;
}

export const nfts: NFT[] = [
  { id: "1", name: "Monarch #247", collection: "Monarch Genesis", image: "", floorPrice: 12.5, lastSale: 14.2, change: 8.5, rarity: "Legendary" },
  { id: "2", name: "DeGod #1842", collection: "DeGods", image: "", floorPrice: 38.2, lastSale: 35.0, change: -2.1, rarity: "Rare" },
  { id: "3", name: "Okay Bear #992", collection: "Okay Bears", image: "", floorPrice: 8.4, lastSale: 9.1, change: 4.3, rarity: "Uncommon" },
  { id: "4", name: "SMB #3311", collection: "SMB Gen2", image: "", floorPrice: 5.8, lastSale: 6.2, change: 1.2, rarity: "Common" },
  { id: "5", name: "Tensorian #567", collection: "Tensorians", image: "", floorPrice: 3.2, lastSale: 2.8, change: -5.6, rarity: "Rare" },
  { id: "6", name: "Mad Lad #2100", collection: "Mad Lads", image: "", floorPrice: 95.0, lastSale: 88.0, change: 12.3, rarity: "Legendary" },
  { id: "7", name: "Clayno #445", collection: "Claynosaurz", image: "", floorPrice: 6.1, lastSale: 5.5, change: -3.2, rarity: "Uncommon" },
  { id: "8", name: "Famous Fox #789", collection: "Famous Fox Fed", image: "", floorPrice: 2.1, lastSale: 2.4, change: 6.7, rarity: "Common" },
];

export const analyticsData = {
  monthlyPnl: [
    { month: "Sep", pnl: -2400 },
    { month: "Oct", pnl: 3200 },
    { month: "Nov", pnl: 5800 },
    { month: "Dec", pnl: -1200 },
    { month: "Jan", pnl: 7400 },
    { month: "Feb", pnl: 4100 },
  ],
  portfolioGrowth: Array.from({ length: 180 }, (_, i) => ({
    date: new Date(Date.now() - (179 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: 20000 + Math.random() * 5000 + i * 150 + Math.sin(i / 10) * 3000,
  })),
  allocationHistory: [
    { month: "Sep", SOL: 80, RAY: 8, JUP: 5, Other: 7 },
    { month: "Oct", SOL: 82, RAY: 7, JUP: 5, Other: 6 },
    { month: "Nov", SOL: 85, RAY: 5, JUP: 6, Other: 4 },
    { month: "Dec", SOL: 88, RAY: 4, JUP: 4, Other: 4 },
    { month: "Jan", SOL: 90, RAY: 3, JUP: 4, Other: 3 },
    { month: "Feb", SOL: 93, RAY: 2.7, JUP: 2.2, Other: 2.1 },
  ],
  realizedGains: 8420,
  unrealizedGains: 13658.28,
};

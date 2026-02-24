import { motion } from "framer-motion";
import { useNFTs } from "@/hooks/usePortfolio";
import { useState } from "react";
import { useAppStore } from "@/stores/appStore";
import { ExternalLink, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { NFTAsset } from "@/lib/helius";

export default function NFTs() {
  const navigate = useNavigate();
  const { activeWalletAddress } = useAppStore();
  const { data: nftData, isLoading } = useNFTs(activeWalletAddress);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!activeWalletAddress) {
    return (
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-12 text-center max-w-md mx-auto mt-12 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6 text-accent-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No wallet scanned</h3>
          <p className="text-sm text-muted-foreground">Scan a wallet address to view NFT holdings.</p>
          <button onClick={() => navigate("/")} className="px-4 py-2 rounded-xl monarch-gradient text-primary-foreground text-sm font-medium">Go to Dashboard</button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-64" />)}
        </div>
      </div>
    );
  }

  const nfts: NFTAsset[] = nftData || [];

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
        <h1 className="page-title">NFTs <span className="text-muted-foreground font-normal text-lg ml-2">{nfts.length}</span></h1>

        {nfts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-6 h-6 text-accent-foreground" />
            </div>
            <p className="text-foreground font-medium">No NFTs found</p>
            <p className="text-sm text-muted-foreground mt-1">This wallet doesn't hold any NFTs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {nfts.map((nft, i) => (
              <motion.div key={nft.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.3 }}
                onMouseEnter={() => setHoveredId(nft.id)} onMouseLeave={() => setHoveredId(null)}
                className="glass-card-hover overflow-hidden group cursor-pointer">
                <div className="aspect-square bg-gradient-to-br from-muted/50 to-accent/30 relative overflow-hidden">
                  {nft.image ? (
                    <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-muted-foreground/20">{nft.name?.slice(0, 2).toUpperCase() || "?"}</span>
                    </div>
                  )}
                  <motion.div initial={false} animate={{ opacity: hoveredId === nft.id ? 1 : 0 }} transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 p-4">
                    <p className="text-sm font-medium text-foreground text-center">{nft.name}</p>
                    <a href={`https://solscan.io/token/${nft.id}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline mt-2">
                      Explorer <ExternalLink className="w-3 h-3" />
                    </a>
                  </motion.div>
                </div>
                <div className="p-4 space-y-1.5">
                  <p className="text-sm font-semibold text-foreground truncate">{nft.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{nft.collection !== "Unknown Collection" ? nft.collection : nft.mint?.slice(0, 12) + "..."}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
